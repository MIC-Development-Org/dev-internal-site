import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { TeamModel, type Team } from "@/models/Team";
import { UserModel, type User } from "@/models/User";
import { ProjectModel } from "@/models/Project";

export const TEAM_MIN_MEMBERS = 5;
export const TEAM_MAX_MEMBERS = 6;
export const TEAM_MIN_SENIORS = 1;
export const TEAM_MAX_SENIORS = 2;

export type TeamMember = Pick<User, "_id" | "name" | "email" | "photoUrl" | "role" | "batch">;

export type TeamWithMembers = {
  _id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  members: TeamMember[];
  projectId: string | null;
  points: number;
  createdAt: Date;
};

const MEMBER_PROJECTION = "_id name email photoUrl role batch";

async function hydrateTeam(team: Team): Promise<TeamWithMembers> {
  const members = await UserModel.find({ _id: { $in: team.memberIds } })
    .select(MEMBER_PROJECTION)
    .lean<TeamMember[]>();

  return {
    _id: String(team._id),
    name: team.name,
    leaderId: String(team.leaderId),
    memberIds: team.memberIds.map(String),
    members,
    projectId: team.projectId ? String(team.projectId) : null,
    points: team.points,
    createdAt: team.createdAt,
  };
}

/** Only returns the requesting user's own team — never another team's roster. */
export async function getMyTeam(teamId: string | null): Promise<TeamWithMembers | null> {
  if (!teamId) return null;
  await connectToDatabase();
  const team = await TeamModel.findById(teamId).lean();
  if (!team) return null;
  return hydrateTeam(team);
}

export async function getAllTeams(): Promise<TeamWithMembers[]> {
  await connectToDatabase();
  const teams = await TeamModel.find().sort({ createdAt: -1 }).lean();
  return Promise.all(teams.map(hydrateTeam));
}

export async function getTeamById(teamId: string): Promise<TeamWithMembers | null> {
  await connectToDatabase();
  const team = await TeamModel.findById(teamId).lean();
  if (!team) return null;
  return hydrateTeam(team);
}

export async function getUnassignedMembers(): Promise<TeamMember[]> {
  await connectToDatabase();
  return UserModel.find({ teamId: null }).select(MEMBER_PROJECTION).lean<TeamMember[]>();
}

export function countSeniors(members: { role: string }[]) {
  return members.filter((m) => m.role === "senior" || m.role === "admin").length;
}

export async function deleteTeamCascade(teamId: string) {
  await connectToDatabase();
  await UserModel.updateMany({ teamId }, { $set: { teamId: null } });
  await ProjectModel.deleteMany({ teamId });
  await TeamModel.findByIdAndDelete(teamId);
}
