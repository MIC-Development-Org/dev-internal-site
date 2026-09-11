"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { submitProject } from "@/lib/actions/project";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";

type Defaults = {
  title: string;
  description: string;
  techStack: string[];
  repoUrl: string;
  liveUrl: string;
};

export function ProjectForm({ defaults }: { defaults?: Defaults }) {
  const [state, action] = useActionState(submitProject, {});
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [techStack, setTechStack] = useState(defaults?.techStack.join(", ") ?? "");
  const [repoUrl, setRepoUrl] = useState(defaults?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(defaults?.liveUrl ?? "");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Project submitted.");
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="techStack">Tech stack</Label>
        <Input
          id="techStack"
          name="techStack"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="Next.js, MongoDB, Tailwind"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="repoUrl">Repo URL</Label>
          <Input
            id="repoUrl"
            name="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input
            id="liveUrl"
            name="liveUrl"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
      <SubmitButton pendingLabel="Submitting...">{defaults ? "Save changes" : "Submit project"}</SubmitButton>
    </form>
  );
}
