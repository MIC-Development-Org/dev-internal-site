"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import { claimProject } from "@/lib/actions/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";

type AvailableProject = {
  _id: string;
  title: string;
  description: string;
  techStack?: string[];
};

export function ClaimProjectCard({
  project,
  isLeader,
}: {
  project: AvailableProject;
  isLeader: boolean;
}) {
  const [state, action] = useActionState(claimProject, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(`Project "${project.title}" claimed for your team!`);
  }, [state, project.title]);

  return (
    <Card className="flex flex-col justify-between transition-all duration-200 hover:border-red-500/50 hover:shadow-md hover:shadow-red-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-bold tracking-tight text-white">
            {project.title}
          </CardTitle>
          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Available
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2">
          {isLeader ? (
            <form action={action}>
              <input type="hidden" name="projectId" value={project._id} />
              <SubmitButton
                pendingLabel="Claiming..."
                className="w-full gap-1.5 bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
              >
                <CheckCircle className="size-3.5" />
                Pick This Project
              </SubmitButton>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-2 text-[11px] text-muted-foreground">
              <ShieldAlert className="size-3.5 text-amber-500 shrink-0" />
              <span>Only your team leader can claim this project.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
