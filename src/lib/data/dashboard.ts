import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { TeamModel } from "@/models/Team";
import { ProjectModel } from "@/models/Project";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/constants/project-status";

export type AdminDashboardStats = {
  totalMembers: number;
  totalSeniors: number;
  totalFreshers: number;
  unassignedMembers: number;
  totalTeams: number;
  teamsWithProject: number;
  projectsByStatus: Record<ProjectStatus, number>;
  totalProjects: number;
  recentTeams: {
    _id: string;
    name: string;
    memberCount: number;
    points: number;
    hasProject: boolean;
    createdAt: Date;
  }[];
  recentProjects: {
    _id: string;
    title: string;
    teamName: string;
    status: ProjectStatus;
    updatedAt: Date;
  }[];
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await connectToDatabase();

  const [
    totalMembers,
    totalSeniors,
    totalFreshers,
    unassignedMembers,
    totalTeams,
    teams,
    projectStatusCounts,
    recentTeamsRaw,
    recentProjectsRaw,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ role: "senior" }),
    UserModel.countDocuments({ role: "fresher" }),
    UserModel.countDocuments({ teamId: null }),
    TeamModel.countDocuments(),
    TeamModel.find().select("_id projectId").lean(),
    ProjectModel.aggregate<{ _id: ProjectStatus; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    TeamModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id name memberIds projectId points createdAt")
      .lean(),
    ProjectModel.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("_id title teamId status updatedAt")
      .lean(),
  ]);

  // Build projectsByStatus map
  const projectsByStatus = Object.fromEntries(
    PROJECT_STATUSES.map((s) => [s, 0])
  ) as Record<ProjectStatus, number>;
  for (const row of projectStatusCounts) {
    projectsByStatus[row._id] = row.count;
  }
  const totalProjects = projectStatusCounts.reduce((s, r) => s + r.count, 0);
  const teamsWithProject = teams.filter((t) => !!t.projectId).length;

  // Hydrate recent teams — member count from memberIds array length
  const recentTeams = recentTeamsRaw.map((t) => ({
    _id: String(t._id),
    name: t.name,
    memberCount: t.memberIds.length,
    points: t.points,
    hasProject: !!t.projectId,
    createdAt: t.createdAt,
  }));

  // Hydrate recent projects — look up team names
  const teamIds = recentProjectsRaw.map((p) => p.teamId);
  const teamDocs = await TeamModel.find({ _id: { $in: teamIds } })
    .select("_id name")
    .lean();
  const teamNameById = new Map(teamDocs.map((t) => [String(t._id), t.name]));

  const recentProjects = recentProjectsRaw.map((p) => ({
    _id: String(p._id),
    title: p.title,
    teamName: teamNameById.get(String(p.teamId)) ?? "Unknown team",
    status: p.status as ProjectStatus,
    updatedAt: p.updatedAt as Date,
  }));

  return {
    totalMembers,
    totalSeniors,
    totalFreshers,
    unassignedMembers,
    totalTeams,
    teamsWithProject,
    projectsByStatus,
    totalProjects,
    recentTeams,
    recentProjects,
  };
}
