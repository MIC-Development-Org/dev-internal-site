"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe, Code2, Save } from "lucide-react";
import { updateProjectGithub } from "@/lib/actions/project";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

type ProjectRepoFormProps = {
  defaults?: {
    repoUrl: string;
    liveUrl: string;
    techStack: string[];
  };
};

export function ProjectRepoForm({ defaults }: ProjectRepoFormProps) {
  const [state, action] = useActionState(updateProjectGithub, {});
  const [repoUrl, setRepoUrl] = useState(defaults?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(defaults?.liveUrl ?? "");
  const [techStack, setTechStack] = useState(defaults?.techStack?.join(", ") ?? "");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Repository links saved successfully.");
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="repoUrl" className="flex items-center gap-1.5 text-xs font-semibold">
          <GithubIcon className="size-3.5 text-zinc-400" />
          GitHub Repository URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="repoUrl"
          name="repoUrl"
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/your-org/your-project"
          required
          className="font-mono text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          Provide the GitHub repository link where your team is developing this project.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="liveUrl" className="flex items-center gap-1.5 text-xs font-semibold">
          <Globe className="size-3.5 text-zinc-400" />
          Live Deployment URL <span className="text-xs text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="liveUrl"
          name="liveUrl"
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          placeholder="https://your-project.vercel.app"
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="techStack" className="flex items-center gap-1.5 text-xs font-semibold">
          <Code2 className="size-3.5 text-zinc-400" />
          Tech Stack Used <span className="text-xs text-muted-foreground">(Optional, comma-separated)</span>
        </Label>
        <Input
          id="techStack"
          name="techStack"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="Next.js, TypeScript, Tailwind CSS, PostgreSQL"
          className="text-xs"
        />
      </div>

      <div className="pt-1">
        <SubmitButton pendingLabel="Saving links..." className="gap-1.5 text-xs">
          <Save className="size-3.5" />
          {defaults?.repoUrl ? "Update Links" : "Submit GitHub Repo"}
        </SubmitButton>
      </div>
    </form>
  );
}
