"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { SearchBox } from "@/components/list/search-box";
import { buildHref, type SearchParams } from "@/lib/list-params";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/models/User";

type Member = {
  _id: string;
  name: string;
  photoUrl?: string;
  role: UserRole;
  batch?: string;
  email?: string;
  techStack?: string[];
  teamName?: string | null;
};

// Deterministic color generation for avatar backgrounds, based on F1 team colors
function getAvatarColor(name: string) {
  const colors = [
    "bg-red-600 text-white",      // Ferrari red
    "bg-teal-600 text-white",     // Mercedes teal
    "bg-blue-800 text-white",     // Alpine blue/Red Bull dark
    "bg-orange-500 text-white",   // McLaren papaya
    "bg-emerald-600 text-white",  // Aston Martin green
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Extract Name and ID using regex
function extractNameAndId(fullName: string) {
  // Matches typical roll numbers like 25BCE1760
  const match = fullName.match(/^(.*?)\s*\b(\d{2}[A-Z]{3}\d{4})\b\s*(.*)$/i);
  if (match) {
    const name = [match[1], match[3]].filter(Boolean).join(" ").trim();
    const id = match[2].toUpperCase();
    return { name, id };
  }
  return { name: fullName.trim(), id: null };
}

// Decorative member number (like a racing number), derived from the member's id
function getMemberNumber(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 99) + 1; // 1 to 99
}

function MemberCard({ member }: { member: Member }) {
  const { name } = extractNameAndId(member.name);
  const memberNumber = getMemberNumber(member._id);
  const avatarColor = getAvatarColor(name);
  const techStack = member.techStack ?? [];
  const visibleTech = techStack.slice(0, 3);
  const extraTech = techStack.length - visibleTech.length;

  return (
    <Link href={`/dashboard/directory/${member._id}`} className="block group h-full">
      <Card className="relative overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:border-red-500/50 bg-black border-zinc-800 h-full">

        {/* Decorative member number overlay */}
        <div className="absolute top-0 right-0 p-3 opacity-20 font-mono text-4xl font-black italic tracking-tighter pointer-events-none group-hover:text-red-500 group-hover:opacity-40 transition-colors z-0">
          {memberNumber}
        </div>

        <CardContent className="relative z-10 flex flex-col justify-between gap-4 p-5 h-full">
          <div className="flex items-start justify-between">
            <Avatar className="h-14 w-14 overflow-hidden rounded-md border-b-2 border-r-2 border-zinc-800 shadow-xl after:rounded-md">
              <AvatarImage src={member.photoUrl} alt={name} className="rounded-md object-cover" />
              <AvatarFallback className={cn("rounded-md font-bold", avatarColor)}>
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <RoleBadge role={member.role} />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex flex-col gap-1">
              <h3 className="line-clamp-2 break-words pr-8 text-lg font-bold leading-tight text-white drop-shadow-md" title={name}>{name}</h3>
            </div>

            {visibleTech.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {visibleTech.map((t) => (
                  <span
                    key={t}
                    className="rounded-sm border border-zinc-700 bg-zinc-900/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
                {extraTech > 0 && (
                  <span className="font-mono text-[10px] text-zinc-500">+{extraTech}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Section({ title, count, members }: { title: string; count: number; members: Member[] }) {
  if (members.length === 0) return null;

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-baseline justify-between border-b-2 border-red-500/80 pb-1">
        <h2 className="font-mono text-xl font-bold tracking-tight uppercase drop-shadow-md">{title}</h2>
        <span className="font-mono text-xs text-red-400 drop-shadow-md">{count} MEMBER{count !== 1 ? 'S' : ''}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((m) => (
          <MemberCard key={m._id} member={m} />
        ))}
      </div>
    </div>
  );
}

const ROLE_TABS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "lead", label: "DEPARTMENT LEADS" },
  { value: "senior", label: "SENIOR MEMBERS" },
  { value: "fresher", label: "JUNIOR MEMBERS" },
];

export function DirectoryView({
  members,
  total,
  role,
  params,
  pagination,
}: {
  members: Member[];
  total: number;
  role: UserRole | "all";
  params: SearchParams;
  pagination: ReactNode;
}) {
  const leads = members.filter((m) => m.role === "lead");
  const seniors = members.filter((m) => m.role === "senior");
  const freshers = members.filter((m) => m.role === "fresher");

  return (
    <div className="relative space-y-8 pb-12 min-h-[calc(100vh-2rem)]">
      {/* Decorative background */}
      {/* overflow-clip (not hidden) so the sticky logo layer can pin to the viewport while cards scroll */}
      <div className="absolute inset-0 z-0 pointer-events-none -mx-8 -mt-8 -mb-12 overflow-clip rounded-xl bg-black">
        <div className="sticky top-0 flex h-screen items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mic-logo.png" alt="" className="w-[min(70%,48rem)] select-none opacity-[0.5]" />
        </div>
      </div>

      <div className="flex flex-col gap-1 relative z-10 pt-4 px-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase font-mono">Members</h1>
          <span className="bg-red-500 text-white font-mono text-xs px-2 py-0.5 rounded-sm">{total} MEMBERS</span>
        </div>
        <p className="text-sm text-zinc-400">Find members of the MIC Development Department.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 relative z-10 px-2">
        <SearchBox placeholder="Search by name, email or technology..." />

        <nav aria-label="Filter by role" className="flex flex-wrap items-center gap-1">
          {ROLE_TABS.map((tab) => {
            const active = role === tab.value;
            return (
              <Link
                key={tab.value}
                href={buildHref("/dashboard/directory", params, {
                  role: tab.value === "all" ? undefined : tab.value,
                  page: undefined,
                })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex h-7 items-center rounded-md px-2.5 font-mono text-xs transition-colors",
                  active ? "bg-red-600 text-white hover:bg-red-700" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950 relative z-10 mx-2">
          <div className="text-4xl mb-4">🏁</div>
          <h3 className="font-mono text-xl text-zinc-300 uppercase tracking-widest font-bold">No members found</h3>
          <p className="text-zinc-500 text-sm mt-2">Try a different name, email, or technology.</p>
        </div>
      ) : (
        <div className="space-y-12 relative z-10 px-2">
          <Section title="Department Leads" count={leads.length} members={leads} />
          <Section title="Senior Members" count={seniors.length} members={seniors} />
          <Section title="Junior Members" count={freshers.length} members={freshers} />
          {pagination}
        </div>
      )}
    </div>
  );
}
