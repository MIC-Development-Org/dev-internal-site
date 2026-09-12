"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, FolderKanban, LayoutGrid, Trophy, BookUser, ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────── */
const BAYS = [
  { number: "01", href: "/dashboard/team",        label: "My Team",     description: "View your team and members",           icon: Users        },
  { number: "02", href: "/dashboard/project",     label: "My Project",  description: "Submit and track your project",        icon: FolderKanban },
  { number: "03", href: "/dashboard/showcase",    label: "Projects",    description: "Explore department projects",          icon: LayoutGrid   },
  { number: "04", href: "/dashboard/leaderboard", label: "Leaderboard", description: "View department rankings",             icon: Trophy       },
  { number: "05", href: "/dashboard/directory",   label: "Members",     description: "Find developers and their tech stacks",icon: BookUser     },
];

/* ─────────────────────────────────────────────────────────────────────────
   F1 CAR — Exact blueprint recreation of the reference image.
   viewBox: 0 0 240 145. Center: x=120.
   Features:
   - Atmospheric red glow at the top
   - Red T-cam perched atop the roll hoop
   - Circular roll hoop / airbox intake
   - Glowing red rear wing element behind cockpit
   - Left & right wing mirrors on stalks with glowing red pods
   - Halo safety arch with center strut & driver helmet
   - Tapered monocoque chassis & sculpted sidepod contours
   - Front suspension wishbone struts
   - Upright rounded-rectangle front tires
   - Sweeping multi-element front wing scoops & endplates
   - HUD corner bracket alignment marks
───────────────────────────────────────────────────────────────────────── */
function F1Car({ active }: { active: boolean }) {
  const white = active ? "#ffffff" : "#e5e7eb";
  const dimWhite = active ? "#cbd5e1" : "#9ca3af";
  const darkLine = active ? "#64748b" : "#4b5563";
  const red = "#ff3b30";
  const redGlow = active ? "rgba(255,59,48,0.95)" : "rgba(255,59,48,0.8)";
  const redSubtle = active ? "rgba(255,59,48,0.25)" : "rgba(255,59,48,0.12)";

  return (
    <svg
      viewBox="0 0 240 145"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[105px] sm:max-w-[115px]"
      style={{
        transition: "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.35s ease",
        transform: active ? "scale(1.05)" : "scale(1)",
        filter: active
          ? "drop-shadow(0 0 12px rgba(255,59,48,0.55)) drop-shadow(0 0 3px rgba(255,59,48,0.9))"
          : "drop-shadow(0 0 4px rgba(0,0,0,0.6))",
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Soft atmospheric red glow centered at the top of the car */}
        <radialGradient id="topRedAtmosphere" cx="50%" cy="20%" r="45%">
          <stop offset="0%" stopColor="#ff3b30" stopOpacity={active ? "0.35" : "0.2"} />
          <stop offset="60%" stopColor="#ff3b30" stopOpacity={active ? "0.08" : "0.03"} />
          <stop offset="100%" stopColor="#ff3b30" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── TOP RED AMBIENT GLOW ── */}
      <rect x="20" y="0" width="200" height="90" fill="url(#topRedAtmosphere)" pointerEvents="none" />

      {/* ── HUD CORNER BRACKETS ── */}
      <path d="M 6 22 L 6 6 L 22 6" stroke={dimWhite} strokeWidth="0.8" fill="none" opacity={active ? "0.6" : "0.3"} />
      <path d="M 234 22 L 234 6 L 218 6" stroke={dimWhite} strokeWidth="0.8" fill="none" opacity={active ? "0.6" : "0.3"} />
      <path d="M 6 123 L 6 139 L 22 139" stroke={dimWhite} strokeWidth="0.8" fill="none" opacity={active ? "0.6" : "0.3"} />
      <path d="M 234 123 L 234 139 L 218 139" stroke={dimWhite} strokeWidth="0.8" fill="none" opacity={active ? "0.6" : "0.3"} />

      {/* ── REAR WING (Glowing Red horizontal bar behind cockpit) ── */}
      {/* Left rear wing blade */}
      <rect x="88" y="38" width="24" height="9" rx="1.5" stroke={red} strokeWidth="1.2" fill={redSubtle} />
      <line x1="88" y1="42.5" x2="112" y2="42.5" stroke={redGlow} strokeWidth="0.7" />
      {/* Right rear wing blade */}
      <rect x="128" y="38" width="24" height="9" rx="1.5" stroke={red} strokeWidth="1.2" fill={redSubtle} />
      <line x1="128" y1="42.5" x2="152" y2="42.5" stroke={redGlow} strokeWidth="0.7" />
      {/* Left rear endplate */}
      <rect x="86" y="35" width="2.5" height="15" rx="0.6" stroke={red} strokeWidth="0.9" fill={redGlow} />
      {/* Right rear endplate */}
      <rect x="151.5" y="35" width="2.5" height="15" rx="0.6" stroke={red} strokeWidth="0.9" fill={redGlow} />

      {/* ── T-CAM (Red camera unit on top) ── */}
      <rect x="113" y="17" width="14" height="3.5" rx="1.2" stroke={red} strokeWidth="1.2" fill={red} />
      <line x1="120" y1="20.5" x2="120" y2="25" stroke={red} strokeWidth="1.4" />

      {/* ── AIRBOX & ROLL HOOP (Circular loop with red glow) ── */}
      <path
        d="M 112 35 C 112 25 128 25 128 35 C 128 41 125 45 120 45 C 115 45 112 41 112 35 Z"
        stroke={red}
        strokeWidth="1.3"
        fill="none"
      />
      <circle cx="120" cy="34" r="4.5" stroke={redGlow} strokeWidth="0.9" fill="rgba(0,0,0,0.6)" />

      {/* ── WING MIRRORS (Left & Right with glowing red pods) ── */}
      {/* Left mirror */}
      <line x1="102" y1="58" x2="88" y2="57" stroke={dimWhite} strokeWidth="0.9" />
      <rect x="79" y="53" width="10" height="5.5" rx="2" stroke={red} strokeWidth="1.2" fill={redSubtle} />
      {/* Right mirror */}
      <line x1="138" y1="58" x2="152" y2="57" stroke={dimWhite} strokeWidth="0.9" />
      <rect x="151" y="53" width="10" height="5.5" rx="2" stroke={red} strokeWidth="1.2" fill={redSubtle} />

      {/* ── HALO SAFETY ARCH & DRIVER COCKPIT ── */}
      {/* Halo arched hood (glowing red) */}
      <path
        d="M 104 62 C 104 47 112 43 120 43 C 128 43 136 47 136 62"
        stroke={red}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Halo vertical center pillar */}
      <line x1="120" y1="43" x2="120" y2="58" stroke={red} strokeWidth="1.6" />
      {/* Driver helmet shape inside */}
      <circle cx="120" cy="51" r="5" stroke={dimWhite} strokeWidth="0.9" fill="rgba(0,0,0,0.7)" />
      {/* Cockpit rim */}
      <path
        d="M 104 62 C 108 57 114 55 120 55 C 126 55 132 57 136 62 L 136 66 L 104 66 Z"
        stroke={dimWhite}
        strokeWidth="1"
        fill="none"
      />

      {/* ── MONOCOQUE / NOSECONE CHASSIS (Crisp white lines) ── */}
      <path
        d={`
          M 105 65
          C 106 74 109 88 111 98
          L 114 108
          L 120 113
          L 126 108
          L 129 98
          C 131 88 134 74 135 65
        `}
        stroke={white}
        strokeWidth="1.3"
        fill="none"
      />
      {/* Center nose crease line */}
      <line x1="120" y1="65" x2="120" y2="113" stroke={darkLine} strokeWidth="0.8" strokeDasharray="3 2" />

      {/* ── SIDEPODS & INTAKE CONTOURS ── */}
      {/* Left sidepod shoulder & intake scoop */}
      <path
        d="M 105 67 C 94 66 82 69 76 73 C 71 77 71 85 75 92 C 82 91 94 89 107 88"
        stroke={white}
        strokeWidth="1.2"
        fill="none"
      />
      {/* Right sidepod shoulder & intake scoop */}
      <path
        d="M 135 67 C 146 66 158 69 164 73 C 169 77 169 85 165 92 C 158 91 146 89 133 88"
        stroke={white}
        strokeWidth="1.2"
        fill="none"
      />

      {/* ── SUSPENSION WISHBONES ── */}
      {/* Left suspension struts */}
      <line x1="68" y1="72" x2="105" y2="68" stroke={dimWhite} strokeWidth="0.9" />
      <line x1="68" y1="90" x2="108" y2="87" stroke={dimWhite} strokeWidth="0.9" />
      <line x1="68" y1="95" x2="110" y2="96" stroke={darkLine} strokeWidth="0.7" />
      {/* Right suspension struts */}
      <line x1="172" y1="72" x2="135" y2="68" stroke={dimWhite} strokeWidth="0.9" />
      <line x1="172" y1="90" x2="132" y2="87" stroke={dimWhite} strokeWidth="0.9" />
      <line x1="172" y1="95" x2="130" y2="96" stroke={darkLine} strokeWidth="0.7" />

      {/* ── FRONT TIRES (Upright rounded rectangles matching reference) ── */}
      {/* Left tire */}
      <rect x="42" y="62" width="26" height="58" rx="5" stroke={white} strokeWidth="1.4" fill="rgba(8,8,8,0.9)" />
      <rect x="47" y="67" width="16" height="48" rx="3" stroke={darkLine} strokeWidth="0.7" fill="none" opacity="0.6" />
      {/* Right tire */}
      <rect x="172" y="62" width="26" height="58" rx="5" stroke={white} strokeWidth="1.4" fill="rgba(8,8,8,0.9)" />
      <rect x="177" y="67" width="16" height="48" rx="3" stroke={darkLine} strokeWidth="0.7" fill="none" opacity="0.6" />

      {/* ── FRONT WING (Sculpted aerodynamic scoops & curved planes) ── */}
      {/* Left aero scoop flap */}
      <path
        d="M 48 99 C 58 100 80 106 112 107 L 112 112 C 80 112 58 107 48 104 Z"
        stroke={white}
        strokeWidth="1.2"
        fill="rgba(255,255,255,0.03)"
      />
      {/* Right aero scoop flap */}
      <path
        d="M 192 99 C 182 100 160 106 128 107 L 128 112 C 160 112 182 107 192 104 Z"
        stroke={white}
        strokeWidth="1.2"
        fill="rgba(255,255,255,0.03)"
      />
      {/* Bottom main sweeping wing plane */}
      <path
        d="M 44 104 C 58 110 86 117 120 117 C 154 117 182 110 196 104 L 196 109 C 182 115 154 121 120 121 C 86 121 58 115 44 109 Z"
        stroke={white}
        strokeWidth="1.3"
        fill="rgba(255,255,255,0.04)"
      />
      {/* Left outer endplate */}
      <rect x="41" y="93" width="3" height="20" rx="0.5" stroke={white} strokeWidth="1" fill={dimWhite} />
      {/* Right outer endplate */}
      <rect x="196" y="93" width="3" height="20" rx="0.5" stroke={white} strokeWidth="1" fill={dimWhite} />
    </svg>
  );
}




/* ─────────────────────────────────────────────────────────────────────────
   SPEED STRIPES
───────────────────────────────────────────────────────────────────────── */
function SpeedStripes() {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      <span className="block h-4 w-1 -skew-x-[18deg] bg-red-500" />
      <span className="block h-4 w-1 -skew-x-[18deg] bg-red-500/55" />
      <span className="block h-4 w-1 -skew-x-[18deg] bg-red-500/25" />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PILLAR  (shared structural element between bays)
───────────────────────────────────────────────────────────────────────── */
function Pillar() {
  return (
    <div className="relative w-[10px] shrink-0 self-stretch" aria-hidden="true">
      {/* left edge highlight */}
      <div className="absolute inset-y-0 left-0 w-px bg-zinc-600/60" />
      {/* body */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-800" />
      {/* right edge shadow */}
      <div className="absolute inset-y-0 right-0 w-px bg-black/80" />
      {/* bolt detail - top */}
      <div className="absolute left-1/2 top-3 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-zinc-600 bg-zinc-800" />
      {/* bolt detail - bottom */}
      <div className="absolute bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-zinc-600 bg-zinc-800" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   INDIVIDUAL BAY
───────────────────────────────────────────────────────────────────────── */
function Bay({
  number, href, label, description, icon: Icon, onClick,
}: (typeof BAYS)[number] & { onClick: (href: string) => void }) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onClick(href)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="group relative flex flex-1 shrink-0 flex-col items-center overflow-hidden text-center
                 w-44 sm:w-auto
                 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/40"
      aria-label={`Go to ${label}`}
      style={{
        /* interior depth gradient — darker in bottom corners, lighter center */
        background: active
          ? "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(239,68,68,0.06) 0%, rgba(20,20,20,0.0) 70%), linear-gradient(180deg, #111111 0%, #0a0a0a 100%)"
          : "linear-gradient(180deg, #131313 0%, #0a0a0a 100%)",
        transition: "background 0.3s",
      }}
    >
      {/* ── OVERHEAD LIGHT BAR */}
      <div className="w-full px-5 pt-4 pb-3">
        <div
          className="relative h-[6px] w-full rounded-[1px] transition-all duration-300"
          style={{
            background: active
              ? "linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,1) 30%, rgba(255,80,80,1) 50%, rgba(239,68,68,1) 70%, rgba(239,68,68,0.2) 100%)"
              : "linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.0) 100%)",
            boxShadow: active
              ? "0 0 16px 4px rgba(239,68,68,0.5), 0 4px 12px rgba(239,68,68,0.35), 0 0 2px rgba(255,255,255,0.5)"
              : "none",
          }}
        />
        {/* light housing bracket */}
        <div className="mt-0.5 flex justify-between px-2">
          <div className="h-1.5 w-1 bg-zinc-700" />
          <div className="h-1.5 w-1 bg-zinc-700" />
        </div>
      </div>

      {/* ── BAY NUMBER */}
      <span
        className="font-mono text-[11px] font-bold tracking-[0.2em] transition-colors duration-200"
        style={{ color: active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}
      >
        {number}
      </span>

      {/* ── CAR AREA — large central space */}
      <div className="flex w-full flex-1 items-center justify-center px-3 py-4">
        {/* subtle floor line under the car */}
        <div className="relative flex flex-col items-center gap-0 w-full">
          <F1Car active={active} />
          <div
            className="mt-1.5 h-px w-3/4 transition-colors duration-300"
            style={{ background: active ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)" }}
          />
        </div>
      </div>

      {/* ── CONTENT BLOCK — icon, label, desc, CTA */}
      <div className="flex w-full flex-col items-center gap-2 border-t border-zinc-800/80 px-4 pb-5 pt-4"
        style={{ borderColor: active ? "rgba(239,68,68,0.2)" : undefined }}
      >
        <Icon
          strokeWidth={1.5}
          className="size-5 transition-colors duration-200"
          style={{ color: active ? "rgb(239,68,68)" : "rgba(255,255,255,0.3)" }}
        />

        <span
          className="font-mono text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-200"
          style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.85)" }}
        >
          {label}
        </span>

        <span
          className="text-[10px] leading-snug transition-colors duration-200"
          style={{ color: active ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)" }}
        >
          {description}
        </span>

        <span
          className="mt-1 flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200"
          style={{ color: active ? "rgb(239,68,68)" : "rgba(255,255,255,0.2)" }}
        >
          Explore
          <ArrowRight
            className="size-3 transition-transform duration-200"
            style={{ transform: active ? "translateX(3px)" : "translateX(0)" }}
          />
        </span>
      </div>

      {/* subtle inner glow on hover */}
      {active && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 0 0 30px rgba(239,68,68,0.04), inset 0 0 60px rgba(239,68,68,0.02)",
          }}
        />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PIT LANE FLOOR
───────────────────────────────────────────────────────────────────────── */
function PitLaneFloor() {
  return (
    <div className="relative overflow-hidden" style={{ height: 52 }}>
      {/* perspective grid lines */}
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 800 52" preserveAspectRatio="none" aria-hidden="true">
        {/* horizontal lines */}
        <line x1="0" y1="10" x2="800" y2="10" stroke="#444" strokeWidth="0.6"/>
        <line x1="0" y1="22" x2="800" y2="22" stroke="#333" strokeWidth="0.6"/>
        <line x1="0" y1="36" x2="800" y2="36" stroke="#2a2a2a" strokeWidth="0.6"/>
        {/* vanishing perspective lines from center-top */}
        <line x1="0"   y1="52" x2="400" y2="6" stroke="#555" strokeWidth="0.5"/>
        <line x1="800" y1="52" x2="400" y2="6" stroke="#555" strokeWidth="0.5"/>
        <line x1="160" y1="52" x2="400" y2="6" stroke="#444" strokeWidth="0.4"/>
        <line x1="640" y1="52" x2="400" y2="6" stroke="#444" strokeWidth="0.4"/>
        <line x1="0"   y1="36" x2="400" y2="10" stroke="#3a3a3a" strokeWidth="0.4"/>
        <line x1="800" y1="36" x2="400" y2="10" stroke="#3a3a3a" strokeWidth="0.4"/>
      </svg>
      {/* PIT LANE label */}
      <div className="absolute inset-x-0 bottom-2 flex items-center gap-4 px-4">
        <div className="h-px flex-1 bg-zinc-700/40" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          Pit Lane
        </span>
        <div className="h-px flex-1 bg-zinc-700/40" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────── */
export function PitGarage() {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const exitTarget = useRef("");

  function handleClick(href: string) {
    if (exiting) return;
    exitTarget.current = href;
    setExiting(true);
    setTimeout(() => {
      router.push(href);
      setExiting(false);
    }, 300);
  }

  return (
    <div>
      {/* ── SECTION HEADER */}
      <div className="mb-5 flex items-center gap-2.5">
        <SpeedStripes />
        <div>
          <h2 className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white/80">
            The Garage
          </h2>
          <p className="text-[11px] text-zinc-500">Choose where you want to go.</p>
        </div>
      </div>

      {/* ── GARAGE BUILDING */}
      <div
        className="relative overflow-hidden"
        style={{
          border: "1px solid #2a2a2a",
          background: "#0c0c0c",
          opacity: exiting ? 0.8 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {/* roof overhang / top beam */}
        <div
          className="relative flex h-8 w-full items-center justify-between px-3"
          style={{
            background: "linear-gradient(180deg, #1c1c1c 0%, #111 100%)",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <span className="font-mono text-[8px] tracking-[0.25em] text-zinc-700">MIC·DEV</span>
          {/* red accent stripe on the beam */}
          <div
            className="absolute inset-x-0 bottom-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.7) 20%, rgba(239,68,68,0.9) 50%, rgba(239,68,68,0.7) 80%, transparent 100%)",
            }}
          />
          {/* navigation streak on exit */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] transition-opacity duration-200"
            style={{
              background: exiting
                ? "linear-gradient(90deg, transparent 0%, #fff 40%, #ef4444 50%, #fff 60%, transparent 100%)"
                : "transparent",
              opacity: exiting ? 1 : 0,
            }}
          />
          <span className="font-mono text-[8px] tracking-[0.25em] text-zinc-700">PIT·LANE</span>
        </div>

        {/* five bays with pillars between */}
        <div className="flex overflow-x-auto snap-x snap-mandatory sm:snap-none sm:overflow-visible">
          {BAYS.map((bay, i) => (
            <div key={bay.href} className="flex shrink-0 snap-start sm:flex-1">
              {i !== 0 && <Pillar />}
              <Bay {...bay} onClick={handleClick} />
            </div>
          ))}
        </div>

        {/* bottom structural sill */}
        <div
          className="h-2 w-full"
          style={{
            background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
            borderTop: "1px solid #2a2a2a",
          }}
        />
      </div>

      {/* ── PIT LANE FLOOR */}
      <PitLaneFloor />
    </div>
  );
}
