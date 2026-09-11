import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel, type UserRole } from "@/models/User";
import { TeamModel } from "@/models/Team";

export async function getLeaderboard() {
  await connectToDatabase();
  const users = await UserModel.find().sort({ points: -1, name: 1 }).select("_id name photoUrl role points batch").lean();
  return users.map((u, i) => ({ ...u, _id: String(u._id), rank: i + 1 }));
}

export async function getDirectory(filter?: { role?: UserRole; search?: string }) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filter?.role) query.role = filter.role;
  if (filter?.search) query.name = { $regex: filter.search, $options: "i" };

  const users = await UserModel.find(query).sort({ name: 1 }).select("_id name photoUrl role batch").lean();
  return users.map((u) => ({ ...u, _id: String(u._id) }));
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
