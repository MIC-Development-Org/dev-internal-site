import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel, type ProjectStatus } from "@/models/Project";
import { TeamModel } from "@/models/Team";

export async function getProjectForTeam(teamId: string) {
  await connectToDatabase();
  return ProjectModel.findOne({ teamId }).lean();
}

export async function getProjectById(id: string) {
  await connectToDatabase();
  return ProjectModel.findById(id).lean();
}

export async function getShowcaseProjects(filter?: { status?: ProjectStatus; tech?: string }) {
  await connectToDatabase();
  const query: Record<string, unknown> = { status: { $in: ["approved", "completed"] } };
  if (filter?.status && ["approved", "completed"].includes(filter.status)) {
    query.status = filter.status;
  }
  if (filter?.tech) {
    query.techStack = filter.tech;
  }
  const projects = await ProjectModel.find(query).sort({ updatedAt: -1 }).lean();
  const teamIds = projects.map((p) => p.teamId).filter(Boolean).map(String);
  const teams = await TeamModel.find({ _id: { $in: teamIds } }).select("_id name").lean();
  const teamNameById = new Map(teams.map((t) => [String(t._id), t.name]));

  return projects.map((p) => ({
    ...p,
    _id: String(p._id),
    teamId: p.teamId ? String(p.teamId) : null,
    teamName: p.teamId ? (teamNameById.get(String(p.teamId)) ?? "Unknown team") : "Unassigned",
  }));
}

export async function getAllProjectsForAdmin(filter?: { status?: ProjectStatus }) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filter?.status) query.status = filter.status;

  const projects = await ProjectModel.find(query).sort({ createdAt: -1 }).lean();
  const teamIds = projects.map((p) => p.teamId).filter(Boolean).map(String);
  const teams = await TeamModel.find({ _id: { $in: teamIds } }).select("_id name").lean();
  const teamNameById = new Map(teams.map((t) => [String(t._id), t.name]));

  return projects.map((p) => ({
    ...p,
    _id: String(p._id),
    teamId: p.teamId ? String(p.teamId) : null,
    teamName: p.teamId ? (teamNameById.get(String(p.teamId)) ?? "Unknown team") : "Unassigned",
  }));
}

export async function getAvailableProjects() {
  await connectToDatabase();
  const projects = await ProjectModel.find({ teamId: null }).sort({ createdAt: -1 }).lean();
  return projects.map((p) => ({
    ...p,
    _id: String(p._id),
    teamId: null,
    teamName: "Unassigned",
  }));
}
