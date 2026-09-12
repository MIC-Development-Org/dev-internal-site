import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * AdminRecord — an allowlist entry granting admin (Race Control) access.
 *
 * Having a document here is the sole requirement for admin access.
 * A person can simultaneously have a User document (member data) and an
 * AdminRecord document — the two collections are fully orthogonal.
 *
 * Add an entry manually in MongoDB or via a seed script:
 *   { email: "user@vitstudent.ac.in", note: "President 2025" }
 */
const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    /** Optional human-readable label, e.g. "President", "Secretary". */
    note: { type: String, default: "" },
  },
  { timestamps: { createdAt: "addedAt", updatedAt: false } }
);

export type AdminRecord = InferSchemaType<typeof adminSchema> & {
  _id: import("mongoose").Types.ObjectId;
};

export const AdminModel: Model<AdminRecord> =
  models.Admin ?? model<AdminRecord>("Admin", adminSchema);
