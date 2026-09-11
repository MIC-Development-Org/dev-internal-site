import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    leaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    memberIds: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    points: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type Team = InferSchemaType<typeof teamSchema> & { _id: import("mongoose").Types.ObjectId };

export const TeamModel: Model<Team> = models.Team ?? model<Team>("Team", teamSchema);
