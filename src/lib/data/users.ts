import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, type UserRole } from "@/models/User";
import { TeamModel } from "@/models/Team";
import { escapeRegex } from "@/lib/validation";
import type { SortOrder } from "mongoose";

/** Case-insensitive "contains" filter across the given fields (input is escaped, length-capped). */
function searchFilter(search: string | undefined, fields: string[]) {
  const q = search?.trim().slice(0, 100);
  if (!q) return null;
  const regex = { $regex: escapeRegex(q), $options: "i" };
  return { $or: fields.map((f) => ({ [f]: regex })) };
}

export async function getLeaderboard(limit?: number) {
  await connectToDatabase();
  const query = UserModel.find().sort({ points: -1, name: 1 }).select("_id name photoUrl role points batch").lean();
  const users = await (limit ? query.limit(limit) : query);
  return users.map((u, i) => ({ ...u, _id: String(u._id), rank: i + 1 }));
}

/** One page of the standings; `rank` is the absolute position, not the position within the page. */
export async function getLeaderboardPage(page: number, pageSize: number) {
  await connectToDatabase();
  const [total, users] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.find()
      .sort({ points: -1, name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select("_id name photoUrl role points batch")
      .lean(),
  ]);
  const entries = users.map((u, i) => ({ ...u, _id: String(u._id), rank: (page - 1) * pageSize + i + 1 }));
  return { entries, total };
}

/** Absolute standing of a user (1-based). Ties share the order produced by the leaderboard sort (points, then name). */
export async function getUserRank(user: { name: string; points: number }) {
  await connectToDatabase();
  const ahead = await UserModel.countDocuments({
    $or: [{ points: { $gt: user.points } }, { points: user.points, name: { $lt: user.name } }],
  });
  return ahead + 1;
}

/** Points gap to the closest driver ahead (null if already leading). */
export async function getGapToNext(points: number): Promise<number | null> {
  await connectToDatabase();
  const ahead = await UserModel.findOne({ points: { $gt: points } }).sort({ points: 1 }).select("points").lean();
  return ahead ? ahead.points - points : null;
}

const ROLE_RANK_STAGE = {
  $addFields: {
    roleRank: { $switch: { branches: [{ case: { $eq: ["$role", "lead"] }, then: 0 }, { case: { $eq: ["$role", "senior"] }, then: 1 }], default: 2 } },
  },
};

/** Server-side filtered, paginated directory (leads first, then seniors, then juniors; A–Z within each). */
export async function getDirectoryPage(filter: { role?: UserRole; search?: string; page: number; pageSize: number }) {
  await connectToDatabase();
  const match: Record<string, unknown> = {};
  if (filter.role) match.role = filter.role;
  const search = searchFilter(filter.search, ["name", "email", "techStack"]);
  if (search) Object.assign(match, search);

  const [result, teams] = await Promise.all([
    UserModel.aggregate<{ total: { count: number }[]; users: Record<string, unknown>[] }>([
      { $match: match },
      ROLE_RANK_STAGE,
      {
        $facet: {
          total: [{ $count: "count" }],
          users: [
            { $sort: { roleRank: 1, name: 1 } },
            { $skip: (filter.page - 1) * filter.pageSize },
            { $limit: filter.pageSize },
            { $project: { name: 1, photoUrl: 1, role: 1, batch: 1, email: 1, techStack: 1, teamId: 1 } },
          ],
        },
      },
    ]),
    TeamModel.find().select("_id name").lean(),
  ]);
  const teamNames = new Map(teams.map((t) => [String(t._id), t.name]));
  const { total, users } = result[0];

  return {
    total: total[0]?.count ?? 0,
    members: users.map((u) => {
      const teamId = u.teamId ? String(u.teamId) : null;
      return {
        _id: String(u._id),
        name: u.name as string,
        photoUrl: u.photoUrl as string | undefined,
        role: u.role as UserRole,
        batch: u.batch as string | undefined,
        email: u.email as string | undefined,
        techStack: (u.techStack as string[] | undefined) ?? [],
        teamId,
        teamName: teamId ? (teamNames.get(teamId) ?? null) : null,
      };
    }),
  };
}

export const ADMIN_USER_SORTS = ["name", "email", "batch", "points", "role"] as const;
export type AdminUserSort = (typeof ADMIN_USER_SORTS)[number];

/** Admin user table: search, role filter, sort and pagination all happen in MongoDB. */
export async function getAdminUsersPage(opts: {
  search?: string;
  role?: UserRole;
  sort: AdminUserSort;
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
}) {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (opts.role) filter.role = opts.role;
  const search = searchFilter(opts.search, ["name", "email", "batch"]);
  if (search) Object.assign(filter, search);

  const direction: SortOrder = opts.dir === "asc" ? 1 : -1;
  const sort: Record<string, SortOrder> = { [opts.sort]: direction };
  if (opts.sort !== "name") sort.name = 1;

  const [total, users] = await Promise.all([
    UserModel.countDocuments(filter),
    UserModel.find(filter)
      .sort(sort)
      .skip((opts.page - 1) * opts.pageSize)
      .limit(opts.pageSize)
      .lean(),
  ]);
  return {
    total,
    users: users.map((u) => ({ ...u, _id: String(u._id), teamId: u.teamId ? String(u.teamId) : null })),
  };
}

export async function getAllUsersForAdmin() {
  await connectToDatabase();
  const users = await UserModel.find().sort({ name: 1 }).lean();
  return users.map((u) => ({ ...u, _id: String(u._id), teamId: u.teamId ? String(u.teamId) : null }));
}

export async function getMemberProfile(id: string) {
  await connectToDatabase();
  const user = await UserModel.findById(id).lean();
  if (!user) return null;

  const rankAbove = await UserModel.countDocuments({ points: { $gt: user.points } });
  const team = user.teamId ? await TeamModel.findById(user.teamId).select("_id name").lean() : null;

  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    role: user.role,
    batch: user.batch,
    hobbies: user.hobbies,
    techStack: user.techStack,
    portfolioUrl: user.portfolioUrl,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    points: user.points,
    rank: rankAbove + 1,
    teamId: team ? String(team._id) : null,
    teamName: team?.name ?? null,
  };
}
