/**
 * Seeds demo data (two real members, one team, projects, leaderboard filler).
 *
 *   MONGODB_URI=... ME_NAME="..." ME_EMAIL=... PARTNER_NAME="..." PARTNER_EMAIL=... \
 *     npx tsx scripts/seed-demo.ts            # create / refresh demo data
 *   MONGODB_URI=... ME_EMAIL=... PARTNER_EMAIL=... npx tsx scripts/seed-demo.ts --clean
 *
 * Everything created is tagged so --clean can remove it: filler users use
 * @demo.invalid emails, the team is named "[DEMO] ...", projects are titled
 * "[DEMO] ...". The two real users are upserted by email (their profile is
 * only touched to attach/detach the demo team and points).
 */
import mongoose from "mongoose";
import { UserModel } from "../src/models/User";
import { TeamModel } from "../src/models/Team";
import { ProjectModel } from "../src/models/Project";
import { AdminModel } from "../src/models/Admin";
import { PointsLogModel } from "../src/models/PointsLog";

const TEAM_NAME = "[DEMO] Apex Racing";
const DEMO_EMAIL_DOMAIN = "@demo.invalid";

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function clean(emails: string[]) {
  const team = await TeamModel.findOne({ name: TEAM_NAME });
  const demoUsers = await UserModel.find({ email: { $regex: `${DEMO_EMAIL_DOMAIN}$` } });
  const ids = demoUsers.map((u) => u._id);
  await PointsLogModel.deleteMany({
    $or: [{ targetId: { $in: ids } }, ...(team ? [{ targetId: team._id }] : []), { reason: /^\[DEMO\]/ }],
  });
  await ProjectModel.deleteMany({ title: /^\[DEMO\]/ });
  if (team) await TeamModel.deleteOne({ _id: team._id });
  await UserModel.deleteMany({ _id: { $in: ids } });
  await UserModel.updateMany({ email: { $in: emails } }, { $set: { teamId: null, points: 0 } });
  console.log("Demo data removed.");
}

async function seed() {
  const me = {
    name: need("ME_NAME"),
    email: need("ME_EMAIL").toLowerCase(),
  };
  const partner = {
    name: need("PARTNER_NAME"),
    email: need("PARTNER_EMAIL").toLowerCase(),
  };

  const upsertReal = (p: { name: string; email: string }, role: "lead" | "senior" | "fresher", extra = {}) =>
    UserModel.findOneAndUpdate(
      { email: p.email },
      { $setOnInsert: { name: p.name, email: p.email, role }, $set: extra },
      { upsert: true, new: true }
    );

  const leader = await upsertReal(me, "lead", { batch: "2024", techStack: ["Next.js", "TypeScript", "MongoDB"] });
  const mate = await upsertReal(partner, "senior", { batch: "2024", techStack: ["React", "Node.js"] });

  // Re-runs start from a clean demo team.
  await clean([me.email, partner.email]);

  const team = await TeamModel.create({
    name: TEAM_NAME,
    leaderId: leader!._id,
    memberIds: [leader!._id, mate!._id],
    points: 240,
  });

  const teamProject = await ProjectModel.create({
    teamId: team._id,
    title: "[DEMO] Pit Wall Telemetry Dashboard",
    description: "Live dashboard that visualises lap data and strategy for the department's race-day events.",
    techStack: ["Next.js", "MongoDB", "Tailwind"],
    repoUrl: "https://github.com/MIC-Development-Org/demo-pit-wall",
    status: "in_progress",
    feedback: [{ note: "Great scope. Approved, please share the repo link.", byAdminId: leader!._id }],
  });
  team.projectId = teamProject._id;
  await team.save();

  // Unassigned projects so the "pick a project" flow has something to show.
  await ProjectModel.insertMany([
    {
      title: "[DEMO] Club Event Ticketing",
      description: "QR-based ticket issuing and gate validation for club events.",
      techStack: ["Next.js", "Redis"],
      status: "approved",
    },
    {
      title: "[DEMO] Member Skill Graph",
      description: "Visual map of member skills to help form balanced teams.",
      techStack: ["React", "D3"],
      status: "approved",
    },
    {
      title: "[DEMO] Workshop Feedback Bot",
      description: "Collects and summarises attendee feedback after each workshop.",
      techStack: ["Node.js", "OpenAI"],
      status: "approved",
    },
  ]);

  // Leaderboard filler.
  const filler = [
    ["Aarav Menon", "senior", 410],
    ["Isha Rao", "fresher", 275],
    ["Kabir Shah", "fresher", 190],
    ["Meera Nair", "senior", 150],
    ["Rohan Iyer", "fresher", 60],
  ] as const;
  await UserModel.insertMany(
    filler.map(([name, role, points], i) => ({
      name,
      role,
      points,
      batch: i % 2 ? "2025" : "2024",
      email: `demo${i + 1}${DEMO_EMAIL_DOMAIN}`,
      techStack: ["React", "TypeScript"],
    }))
  );

  await UserModel.updateOne({ _id: leader!._id }, { $set: { teamId: team._id, points: 320 } });
  await UserModel.updateOne({ _id: mate!._id }, { $set: { teamId: team._id, points: 215 } });

  await PointsLogModel.insertMany([
    { targetId: leader!._id, targetType: "user", amount: 320, reason: "[DEMO] Kickoff bonus", awardedBy: leader!._id },
    { targetId: mate!._id, targetType: "user", amount: 215, reason: "[DEMO] First sprint", awardedBy: leader!._id },
    { targetId: team._id, targetType: "team", amount: 240, reason: "[DEMO] Team formation", awardedBy: leader!._id },
  ]);

  await AdminModel.updateOne(
    { email: me.email },
    { $setOnInsert: { email: me.email, note: "Demo admin" } },
    { upsert: true }
  );

  console.log(`Seeded: team "${TEAM_NAME}" (${me.email} leader, ${partner.email}), 4 projects, 5 filler members.`);
}

async function main() {
  await mongoose.connect(need("MONGODB_URI"));
  try {
    if (process.argv.includes("--clean")) {
      await clean([need("ME_EMAIL").toLowerCase(), need("PARTNER_EMAIL").toLowerCase()]);
    } else {
      await seed();
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
