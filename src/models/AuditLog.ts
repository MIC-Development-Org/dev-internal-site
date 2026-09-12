import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const AUDIT_ACTIONS = [
  "role_changed",
  "team_created",
  "team_roster_updated",
  "team_dissolved",
  "project_status_changed",
  "project_created",
  "project_updated",
  "project_deleted",
  "settings_updated",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AuditLog = InferSchemaType<typeof auditLogSchema> & { _id: import("mongoose").Types.ObjectId };

export const AuditLogModel: Model<AuditLog> =
  models.AuditLog ?? model<AuditLog>("AuditLog", auditLogSchema);
