import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { USER_ROLES, type UserRole } from "@/lib/constants/roles";

export { USER_ROLES, type UserRole };

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    photoUrl: { type: String, default: "" },
    role: { type: String, enum: USER_ROLES, default: "fresher" },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    points: { type: Number, default: 0 },
    batch: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type User = InferSchemaType<typeof userSchema> & { _id: import("mongoose").Types.ObjectId };

export const UserModel: Model<User> = models.User ?? model<User>("User", userSchema);
