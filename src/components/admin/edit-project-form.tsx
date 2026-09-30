"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminEditProject } from "@/lib/actions/admin";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/constants/project-status";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";

type TeamOption = {
  _id: string;
  name: string;
  memberCount: number;
};

type EditProjectFormProps = {
  projectId: string;
  defaults: {
    title: string;
    description: string;
    techStack: string[];
    repoUrl: string;
    liveUrl: string;
    status: ProjectStatus;
    teamId: string | null;
  };
  teams: TeamOption[];
};

export function EditProjectForm({ projectId, defaults, teams }: EditProjectFormProps) {
  const [state, action] = useActionState(adminEditProject, {});

  const [title, setTitle] = useState(defaults.title);
  const [description, setDescription] = useState(defaults.description);
  const [techStack, setTechStack] = useState(defaults.techStack.join(", "));
  const [repoUrl, setRepoUrl] = useState(defaults.repoUrl);
  const [liveUrl, setLiveUrl] = useState(defaults.liveUrl);
  const [status, setStatus] = useState<ProjectStatus>(defaults.status);
  const [teamId, setTeamId] = useState<string>(defaults.teamId ?? "");

  useEffect(() => {
    if (state.error && !state.fieldErrors) toast.error(state.error);
    if (state.success) toast.success("Project updated successfully.");
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="space-y-1.5">
        <Label htmlFor="edit-project-title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="edit-project-title"
          name="title"
          aria-invalid={Boolean(state.fieldErrors?.title)}
          aria-describedby={state.fieldErrors?.title ? "edit-project-title-error" : undefined}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <FieldError id="edit-project-title" message={state.fieldErrors?.title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-project-desc">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="edit-project-desc"
          name="description"
          aria-invalid={Boolean(state.fieldErrors?.description)}
          aria-describedby={state.fieldErrors?.description ? "edit-project-desc-error" : undefined}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
        <FieldError id="edit-project-desc" message={state.fieldErrors?.description} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-project-tech">Tech Stack (comma-separated)</Label>
        <Input
          id="edit-project-tech"
          name="techStack"
          aria-invalid={Boolean(state.fieldErrors?.techStack)}
          aria-describedby={state.fieldErrors?.techStack ? "edit-project-tech-error" : undefined}
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="Next.js, TypeScript, Tailwind"
        />
        <FieldError id="edit-project-tech" message={state.fieldErrors?.techStack} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-project-repo">Repository URL</Label>
          <Input
            id="edit-project-repo"
            name="repoUrl"
            aria-invalid={Boolean(state.fieldErrors?.repoUrl)}
            aria-describedby={state.fieldErrors?.repoUrl ? "edit-project-repo-error" : undefined}
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
          <FieldError id="edit-project-repo" message={state.fieldErrors?.repoUrl} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-project-live">Live Demo URL</Label>
          <Input
            id="edit-project-live"
            name="liveUrl"
            aria-invalid={Boolean(state.fieldErrors?.liveUrl)}
            aria-describedby={state.fieldErrors?.liveUrl ? "edit-project-live-error" : undefined}
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
          />
          <FieldError id="edit-project-live" message={state.fieldErrors?.liveUrl} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-project-status">Status</Label>
          <select
            id="edit-project-status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-project-team">Assigned Team</Label>
          <select
            id="edit-project-team"
            name="teamId"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">Unassigned (Project Pool)</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.memberCount} members)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton pendingLabel="Saving changes...">Save Project Changes</SubmitButton>
      </div>
    </form>
  );
}
