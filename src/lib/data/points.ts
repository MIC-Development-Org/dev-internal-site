import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { PointsLogModel } from "@/models/PointsLog";
import { UserModel } from "@/models/User";
import { TeamModel } from "@/models/Team";

export async function getRecentPointsLogs(limit = 25) {
  await connectToDatabase();
  const logs = await PointsLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();

  const userIds = logs.filter((l) => l.targetType === "user").map((l) => l.targetId);
  const teamIds = logs.filter((l) => l.targetType === "team").map((l) => l.targetId);
  const awardedByIds = logs.map((l) => l.awardedBy);

  const [users, teams, admins] = await Promise.all([
    UserModel.find({ _id: { $in: userIds } }).select("_id name").lean(),
    TeamModel.find({ _id: { $in: teamIds } }).select("_id name").lean(),
    UserModel.find({ _id: { $in: awardedByIds } }).select("_id name").lean(),
  ]);

  const userNameById = new Map(users.map((u) => [String(u._id), u.name]));
  const teamNameById = new Map(teams.map((t) => [String(t._id), t.name]));
  const adminNameById = new Map(admins.map((a) => [String(a._id), a.name]));

  return logs.map((l) => ({
    _id: String(l._id),
    targetType: l.targetType,
    targetName:
      l.targetType === "user"
        ? (userNameById.get(String(l.targetId)) ?? "Unknown user")
        : (teamNameById.get(String(l.targetId)) ?? "Unknown team"),
    amount: l.amount,
    reason: l.reason,
    awardedByName: adminNameById.get(String(l.awardedBy)) ?? "Unknown",
    createdAt: l.createdAt,
  }));
}
