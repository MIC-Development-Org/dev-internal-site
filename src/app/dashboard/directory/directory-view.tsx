"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { cn } from "cn";
import type { UserRole } from "@/models/User";

type Member = {
  _id: string;
  name: string;
  photoUrl?: string;
  role: UserRole;
  batch?: string;
};

// Deterministic color generation for avatar backgrounds based on F1 team colors
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

// F1 "Driver Number" based on ID hash
function getDriverNumber(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 99) + 1; // 1 to 99
}

function MemberCard({ member }: { member: Member }) {
  const { name, id } = extractNameAndId(member.name);
  const driverNumber = getDriverNumber(member._id);
  const avatarColor = getAvatarColor(name);
  
  const bgImage = member.role === "lead" || member.role === "admin" 
    ? "/img1.png" 
    : member.role === "senior" 
      ? "/img2.png" 
      : "/img3.png";

  return (
    <Link href={`/dashboard/directory/${member._id}`} className="block group h-full">
      <Card className="relative overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:border-red-500/50 bg-black border-zinc-800 h-full">
        
        {/* Background Driver Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-lighten">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={bgImage} alt="" className="w-full h-full object-cover object-top opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-smoke" />
        </div>

        {/* Driver Number overlay */}
        <div className="absolute top-0 right-0 p-3 opacity-20 font-mono text-4xl font-black italic tracking-tighter pointer-events-none group-hover:text-red-500 group-hover:opacity-40 transition-colors z-0">
          {driverNumber}
        </div>
        
        <CardContent className="relative z-10 flex flex-col justify-between gap-4 p-5 h-full">
          <div className="flex items-start justify-between">
            <Avatar className={cn("h-14 w-14 rounded-md border-b-2 border-r-2 border-zinc-800 shadow-xl", avatarColor)}>
              <AvatarImage src={member.photoUrl} alt={name} className="object-cover" />
              <AvatarFallback className="rounded-none bg-transparent font-bold">
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <RoleBadge role={member.role} />
          </div>
          
          <div className="flex flex-col gap-1 mt-4">
            <h3 className="font-bold text-lg leading-tight truncate pr-8 drop-shadow-md text-white">{name}</h3>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-300 uppercase drop-shadow-md">
                {id ? id : "NO ID"}
              </span>
              <span className="font-mono text-[10px] bg-zinc-900/80 px-2 py-0.5 text-zinc-300 border border-zinc-700 backdrop-blur-sm">
                SEASON {member.batch ? member.batch : "N/A"}
              </span>
            </div>
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
        <span className="font-mono text-xs text-red-400 drop-shadow-md">{count} DRIVER{count !== 1 ? 'S' : ''}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((m) => (
          <MemberCard key={m._id} member={m} />
        ))}
      </div>
    </div>
  );
}

export function DirectoryView({ initialMembers }: { initialMembers: Member[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<UserRole | "all">("all");

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = activeTab === "all" || m.role === activeTab || (activeTab === "lead" && m.role === "admin");
      return matchesSearch && matchesRole;
    });
  }, [initialMembers, search, activeTab]);

  const leads = filteredMembers.filter(m => m.role === "lead" || m.role === "admin");
  const seniors = filteredMembers.filter(m => m.role === "senior");
  const freshers = filteredMembers.filter(m => m.role === "fresher");

  return (
    <div className="relative space-y-8 pb-12 min-h-[calc(100vh-2rem)]">
      {/* Directory Background */}
      <div className="absolute inset-0 z-0 pointer-events-none -mx-8 -mt-8 -mb-12 overflow-hidden rounded-xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bg.jpeg" alt="" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
      </div>

      <div className="flex flex-col gap-1 relative z-10 pt-4 px-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase font-mono">Pit Lane Directory</h1>
          <span className="bg-red-500 text-white font-mono text-xs px-2 py-0.5 rounded-sm">{initialMembers.length} ROSTERED</span>
        </div>
        <p className="text-sm text-zinc-400">Team principals, drivers, and junior academy members.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 relative z-10 px-2">
        <div className="relative w-full sm:max-w-xs">
          <Input
            type="search"
            placeholder="Search roster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border-zinc-700 font-mono focus-visible:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className={cn("font-mono text-xs rounded-md", activeTab === "all" ? "bg-red-600 hover:bg-red-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800")}
          >
            ALL
          </Button>
          <Button
            variant={activeTab === "lead" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("lead")}
            className={cn("font-mono text-xs rounded-md", activeTab === "lead" ? "bg-red-600 hover:bg-red-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800")}
          >
            PRINCIPALS
          </Button>
          <Button
            variant={activeTab === "senior" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("senior")}
            className={cn("font-mono text-xs rounded-md", activeTab === "senior" ? "bg-red-600 hover:bg-red-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800")}
          >
            DRIVERS
          </Button>
          <Button
            variant={activeTab === "fresher" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("fresher")}
            className={cn("font-mono text-xs rounded-md", activeTab === "fresher" ? "bg-red-600 hover:bg-red-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800")}
          >
            JUNIORS
          </Button>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950 relative z-10 mx-2">
          <div className="text-4xl mb-4">🏁</div>
          <h3 className="font-mono text-xl text-zinc-300 uppercase tracking-widest font-bold">In The Pit Box</h3>
          <p className="text-zinc-500 text-sm mt-2">No matching drivers found for your telemetry.</p>
        </div>
      ) : (
        <div className="space-y-12 relative z-10 px-2">
          <Section title="Team Principals" count={leads.length} members={leads} />
          <Section title="Drivers" count={seniors.length} members={seniors} />
          <Section title="Junior Academy" count={freshers.length} members={freshers} />
        </div>
      )}
    </div>
  );
}
