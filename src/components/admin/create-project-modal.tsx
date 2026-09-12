"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, FolderPlus } from "lucide-react";
import { adminCreateProject } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TeamOption = {
  _id: string;
  name: string;
  memberCount: number;
};

export function CreateProjectModal({ teams }: { teams: TeamOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(adminCreateProject, {});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Project created successfully.");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setDescription("");
      setTeamId("");
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="inline-flex items-center gap-1.5 bg-red-600 font-semibold text-white hover:bg-red-700">
            <Plus className="size-4" />
            Add Project
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <FolderPlus className="size-4" />
            </div>
            <div>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Add a project to the available pool or assign it directly to a team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="create-project-title">
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-project-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Telemetry Dashboard"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-project-desc">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="create-project-desc"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the project scope, requirements, and deliverables..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-project-team">
              Team Allocation <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <select
              id="create-project-team"
              name="teamId"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">Unassigned (Available for teams to pick)</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.memberCount} members)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton pendingLabel="Creating...">Create Project</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
