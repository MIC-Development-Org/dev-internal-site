import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/constants/project-status";

export { PROJECT_STATUSES, type ProjectStatus };

const feedbackSchema = new Schema(
  {
    note: { type: String, required: true },
    /** "admin" = race-control review note, "team" = the team's reply when resubmitting. */
    author: { type: String, enum: ["admin", "team"], default: "admin" },
    byAdminId: { type: Schema.Types.ObjectId, ref: "User" },
    byUserId: { type: Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: { type: [String], default: [] },
    repoUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    status: { type: String, enum: PROJECT_STATUSES, default: "submitted" },
    feedback: { type: [feedbackSchema], default: [] },
  },
  { timestamps: true }
);

projectSchema.index({ teamId: 1 });
projectSchema.index({ status: 1, updatedAt: -1 });

export type Project = InferSchemaType<typeof projectSchema> & { _id: import("mongoose").Types.ObjectId };

export const ProjectModel: Model<Project> = models.Project ?? model<Project>("Project", projectSchema);
