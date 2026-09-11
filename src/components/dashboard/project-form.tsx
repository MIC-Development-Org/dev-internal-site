"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { submitProject } from "@/lib/actions/project";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";

export function ProjectForm({
  defaults,
}: {
  defaults?: {
    title: string;
    description: string;
    techStack: string[];
    repoUrl: string;
    liveUrl: string;
  };
}) {
  const [state, action] = useActionState(submitProject, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Project submitted.");
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaults?.title} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={defaults?.description} rows={4} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="techStack">Tech stack</Label>
        <Input
          id="techStack"
          name="techStack"
          defaultValue={defaults?.techStack.join(", ")}
          placeholder="Next.js, MongoDB, Tailwind"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="repoUrl">Repo URL</Label>
          <Input id="repoUrl" name="repoUrl" defaultValue={defaults?.repoUrl} placeholder="https://github.com/..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input id="liveUrl" name="liveUrl" defaultValue={defaults?.liveUrl} placeholder="https://..." />
        </div>
      </div>
      <SubmitButton pendingLabel="Submitting...">{defaults ? "Save changes" : "Submit project"}</SubmitButton>
    </form>
  );
}
