# Product Requirements Document
## MIC Development Department Platform — "Pit Lane"

**Version:** 1.0
**Author:** Gowreesh V T
**Date:** September 11, 2026
**Status:** Draft for Review

---

## 1. Overview

Pit Lane is a standalone, F1-inspired internal platform for the Microsoft Innovation Club (MIC) Development Department at VIT Chennai. It handles three core workflows in one place: team formation, project submission & showcase, and a department leaderboard — replacing scattered Google Forms and WhatsApp coordination with a single dashboard.

The platform ships in **one complete phase** (no phased rollout) and is scoped exclusively to Development Department members.

---

## 2. Goals

- Give every member (fresher or senior) a single dashboard to form teams, track their project, and see where they stand
- Give admins (leads) one place to manage roles, approve projects, assign points, and see the full picture across all teams
- Make the department feel like a team — literally — with an F1 racing identity that makes points, ranks, and progress feel like a race, not a spreadsheet
- Ship fast: manual admin controls over automation wherever automation would slow down v1

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Database | MongoDB (standalone, dedicated instance) |
| Styling | Tailwind CSS + shadcn/ui |
| Theme | Custom F1 theme via tweakcn (`cmtvyy4ap000004l2ckol6qlr`) |
| Auth | Google OAuth (restricted to `@vitstudent.ac.in` / VIT mail domain) |
| Hosting | Vercel (frontend) + MongoDB Atlas |

**Color System**
| Token | Hex | Usage |
|---|---|---|
| F1 Red | `#FF1801` | Primary actions, active states, rank #1 highlight, "lights out" accents |
| Carbon Black | `#15151E` | Base dark surface, cards, nav |
| Pure White | `#FFFFFF` | Text on dark, light-mode base |

---

## 4. Roles & Permissions

| Role | Assigned By | Dashboard | Key Abilities |
|---|---|---|---|
| **Admin** | Manually set by another admin | Admin Dashboard | Manage user roles, review/approve projects, configure leaderboard points, view all teams, set team-formation deadline |
| **Senior** | Default/manual | Member Dashboard | Create/join a team (as senior slot), submit project, view own team, view showcase, leaderboard, directory |
| **Fresher** | Default on first login | Member Dashboard | Same as Senior, minus senior-slot eligibility in team formation |

**First login behavior:** New VIT-mail users are auto-created with role `fresher` and no team. Admin can promote to `senior`/`admin` anytime from the User Management screen.

---

## 5. Feature Breakdown

### 5.1 Authentication
- Google OAuth, domain-restricted to VIT student mail
- On login: look up email in MongoDB `users` collection
  - Not found → create new record, role = `fresher`, `teamId = null`
  - Found → resolve role + team + points, route to correct dashboard
- Profile photo pulled from Google account by default; editable later in profile settings

### 5.2 Team Formation
- **Creation model:** A member becomes "Team Leader" by creating a team and entering the VIT emails of their teammates directly (no invite/accept flow — instant add, matching how the club actually operates)
- **Constraints (soft-enforced, admin can override):**
  - 5–6 members per team
  - 1–2 seniors required per team
- **Visibility:** A team is only visible to its own members. Members cannot browse or see other teams' rosters. Only Admins see all teams across the department.
- **Deadline:** Admin sets a team-formation lock date (default: 3 days from formation opening). After lock:
  - Team creation is disabled for members
  - Unassigned members are flagged for manual admin assignment
- **My Team view** (for members): full roster, senior/fresher tags, linked project, team's total points

### 5.3 Project Submission
- Team Leader submits: project title, description, tech stack, and (once available) repo/live links
- **Status flow:** `Submitted → Under Review → Approved / Changes Requested → In Progress → Completed`
- Admin can approve, reject, or leave a short **feedback note** at any stage — visible to the team so they know why
- Approved + Completed projects surface in the public Showcase

### 5.4 Showcase
- Grid of all approved projects: title, team name (not full roster), tech stack tags, status badge, links
- Filter by status and tech stack
- Individual project detail page

### 5.5 Leaderboard
- **Single overall leaderboard** — no separate individual/team views for v1
- Points are a plain number, fully set by admins (award or deduct), no automatic tracking
- No point-breakdown UI for members in v1 — stored in MongoDB (`pointsLog`) for future auditability, not displayed
- Top 3 get a **podium** treatment (see Section 7 — F1 identity)

### 5.6 Member Directory
- Grid of all department members: photo, name, role badge, batch/year
- Pulled from Google profile photo by default, editable in user's own profile
- Searchable/filterable by role
- Clicking a member shows their rank + team (if not private) — team roster stays private per Section 5.2 rules, so this shows *that they're on a team*, not who else is in it, unless the viewer is on the same team

### 5.7 Admin Dashboard
- **User Management** — table of all members, change role, view team/project status
- **Team Management** — view all teams + rosters, manually create/edit/dissolve teams, force-assign leftover members
- **Project Management** — review queue, approve/reject/feedback, edit status
- **Leaderboard Config** — award/deduct points per user, with an internal reason tag (stored, not shown to members)
- **Settings** — set/edit team-formation deadline, toggle formation phase open/closed

### 5.8 Notifications (lightweight)
- In-dashboard banners, no email/push needed for v1
- Triggers: project status changed, feedback left, team-formation deadline approaching, points awarded

---

## 6. Data Models

```
User {
  _id
  name
  email          // VIT mail, unique
  photoUrl
  role           // 'admin' | 'senior' | 'fresher'
  teamId         // ref → Team, nullable
  points         // number, admin-set
  batch          // year/semester, optional
  createdAt
}

Team {
  _id
  name
  leaderId       // ref → User
  memberIds      // [ref → User], 5-6 entries
  projectId      // ref → Project, nullable
  points         // number, admin-set (team-level)
  createdAt
}

Project {
  _id
  teamId         // ref → Team
  title
  description
  techStack      // [string]
  repoUrl
  liveUrl
  status          // 'submitted' | 'under_review' | 'approved' | 'changes_requested' | 'in_progress' | 'completed'
  feedback        // [{ note, byAdminId, at }]
  createdAt
  updatedAt
}

PointsLog {
  _id
  targetId        // ref → User or Team
  targetType      // 'user' | 'team'
  amount          // +/- number
  reason          // internal tag, not shown to members
  awardedBy       // ref → admin User
  createdAt
}
```

---

## 7. F1 Identity & Easter Eggs

This isn't just a themed color palette — the whole product should *feel* like race weekend. Some ideas to build in:

**Loading & Transitions**
- **Lights-out loading screen**: 5 red lights stacked (like the actual F1 start sequence) that illuminate one by one, then go dark simultaneously ("lights out and away we go") right as the page finishes loading
- Route-transition loader: a small top-down F1 car silhouette that zips across the top of the screen (like a progress bar, but it's a car doing a lap) instead of a plain loading bar

**Backgrounds**
- Hero/landing page: a subtle looping background animation of an F1 car in motion (blurred motion-streak SVG or a lightweight CSS/Framer Motion animated silhouette) — kept subtle behind a dark carbon overlay so text stays readable
- Leaderboard page background: a faint starting-grid pattern (checkered pattern very low opacity) behind the rankings

**Leaderboard as a Race**
- Rank #1 gets a **P1 podium badge** in gold-on-red, #2 and #3 get silver/bronze
- Points displayed like "lap times" — e.g., a small flag/checkered icon next to the number
- Rank changes (if you ever add point history) could show a small ▲/▼ like a live timing screen

**Team Formation**
- Frame teams as "constructors" — e.g., empty state copy: *"No garage yet. Build your team before lights out."*
- Deadline countdown styled like a race countdown clock (red digits, monospace font)

**Micro-copy / Easter Eggs**
- 404 page: *"You've gone off track."* with a small spin-out animation
- Empty states use racing language: *"No laps completed yet"* (no projects), *"Box box box"* (pending review), *"Chequered flag"* (completed project)
- A hidden keyboard shortcut (e.g., typing "DRS") could trigger a fun confetti/speed-boost animation — small, harmless, fun for people who dig into the site
- Admin dashboard could have a subtle "Race Control" label instead of "Admin Panel"
- Hover on your own leaderboard rank shows a small tooltip like *"P{rank} — {points} pts"* styled like a broadcast graphic

**Sound (optional, off by default)**
- A muted-by-default option to play a very short "lights out" engine start sound when the dashboard loads — toggle in settings, since auto-playing sound is usually a bad idea

---

## 8. Screens Summary

**Member Dashboard**
1. My Profile
2. My Team (or Team Formation if none yet)
3. My Project
4. Showcase
5. Leaderboard
6. Directory

**Admin Dashboard**
1. User Management
2. Team Management
3. Project Management
4. Leaderboard Config
5. Settings (deadlines, phase toggles)

---

## 9. Non-Functional Requirements

- Mobile-responsive (members will check this on phones between classes)
- Fast initial load — animations should be lightweight (CSS/SVG over heavy video/WebGL) so the "cool factor" doesn't tank performance
- Access strictly limited to VIT mail domain at the OAuth layer
- Team/project data scoped correctly so members can never query another team's private roster via API (server-side authorization, not just UI hiding)

---

## 10. Future Enhancements (Post-v1)

- Portfolio competition scoring folded into the same points engine
- Point-breakdown transparency for members
- CSV export for admin reporting
- Public-facing showcase view outside the department
- Email/push notifications

---

## 11. Open Questions

- Exact team-formation deadline date for this cycle
- Whether UI/UX members get added into this system now or handled manually outside it (per earlier discussion — TBD)
- Final department mail domain to whitelist for OAuth
