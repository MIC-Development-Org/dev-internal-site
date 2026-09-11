import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { AuditLogModel } from "@/models/AuditLog";

export async function getRecentAuditLogs(limit = 50) {
  await connectToDatabase();
  const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  return logs.map((l) => ({ ...l, _id: String(l._id) }));
}
