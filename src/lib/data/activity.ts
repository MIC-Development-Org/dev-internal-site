import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { PointsLogModel } from "@/models/PointsLog";
import type { TeamWithMembers } from "@/lib/data/teams";
import type { getProjectForTeam } from "@/lib/data/projects";

export type ActivityEntry = { label: string; at: Date };

type ProjectDoc = NonNullable<Awaited<ReturnType<typeof getProjectForTeam>>>;

/**
 * Derives a personal activity feed from real records (team/project
 * timestamps, review feedback, points awards) — there's no generic
 * per-team audit trail, so this composes from the pieces that exist rather
 * than fabricating events.
 */
export async function getMemberActivity(
  team: TeamWithMembers | null,
  project: ProjectDoc | null
): Promise<ActivityEntry[]> {
  const entries: ActivityEntry[] = [];

  if (team) {
    entries.push({ label: "Team created", at: team.createdAt });
  }

  if (project) {
    entries.push({ label: "Project submitted", at: project.createdAt });
    for (const feedback of project.feedback) {
      entries.push({ label: "Changes requested on your project", at: feedback.at });
    }
    if (project.status === "approved") entries.push({ label: "Project approved", at: project.updatedAt });
    if (project.status === "in_progress") entries.push({ label: "Project moved to in progress", at: project.updatedAt });
    if (project.status === "completed") entries.push({ label: "Project marked completed", at: project.updatedAt });
  }

  if (team) {
    await connectToDatabase();
    const logs = await PointsLogModel.find({
      $or: [
        { targetType: "team", targetId: team._id },
        { targetType: "user", targetId: { $in: team.memberIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    for (const log of logs) {
      entries.push({ label: `+${log.amount} points — ${log.reason}`, at: log.createdAt });
    }
  }

  return entries.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 6);
}
