import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const POINTS_TARGET_TYPES = ["user", "team"] as const;
export type PointsTargetType = (typeof POINTS_TARGET_TYPES)[number];

const pointsLogSchema = new Schema(
  {
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: POINTS_TARGET_TYPES, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    awardedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type PointsLog = InferSchemaType<typeof pointsLogSchema> & { _id: import("mongoose").Types.ObjectId };

export const PointsLogModel: Model<PointsLog> =
  models.PointsLog ?? model<PointsLog>("PointsLog", pointsLogSchema);
