import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/constants/project-status";

export { PROJECT_STATUSES, type ProjectStatus };

const feedbackSchema = new Schema(
  {
    note: { type: String, required: true },
    byAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
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

export type Project = InferSchemaType<typeof projectSchema> & { _id: import("mongoose").Types.ObjectId };

export const ProjectModel: Model<Project> = models.Project ?? model<Project>("Project", projectSchema);
