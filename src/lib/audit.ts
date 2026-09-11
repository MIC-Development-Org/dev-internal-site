import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { AuditLogModel, type AuditAction } from "@/models/AuditLog";
import type { User } from "@/models/User";

export async function logAdminAction(actor: User, action: AuditAction, summary: string) {
  await connectToDatabase();
  await AuditLogModel.create({
    actorId: actor._id,
    actorName: actor.name,
    action,
    summary,
  });
}
