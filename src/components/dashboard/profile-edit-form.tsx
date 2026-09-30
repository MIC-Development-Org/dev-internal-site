"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";

type Defaults = {
  batch: string;
  hobbies: string;
  techStack: string[];
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
};

export function ProfileEditForm({ batch, hobbies, techStack, portfolioUrl, linkedinUrl, githubUrl }: Defaults) {
  const [state, action] = useActionState(updateProfile, {});
  const [batchValue, setBatchValue] = useState(batch);
  const [hobbiesValue, setHobbiesValue] = useState(hobbies);
  const [techStackValue, setTechStackValue] = useState(techStack.join(", "));
  const [portfolioUrlValue, setPortfolioUrlValue] = useState(portfolioUrl);
  const [linkedinUrlValue, setLinkedinUrlValue] = useState(linkedinUrl);
  const [githubUrlValue, setGithubUrlValue] = useState(githubUrl);

  useEffect(() => {
    if (state.success) toast.success("Profile updated.");
    if (state.error && !state.fieldErrors) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="batch">Batch / Year</Label>
        <Input
          id="batch"
          name="batch"
          aria-invalid={Boolean(state.fieldErrors?.batch)}
          aria-describedby={state.fieldErrors?.batch ? "batch-error" : undefined}
          value={batchValue}
          onChange={(e) => setBatchValue(e.target.value)}
          placeholder="e.g. 2nd Year, 2027"
        />
        <FieldError id="batch" message={state.fieldErrors?.batch} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hobbies">Hobbies</Label>
        <Textarea
          id="hobbies"
          name="hobbies"
          aria-invalid={Boolean(state.fieldErrors?.hobbies)}
          aria-describedby={state.fieldErrors?.hobbies ? "hobbies-error" : undefined}
          value={hobbiesValue}
          onChange={(e) => setHobbiesValue(e.target.value)}
          rows={3}
          placeholder="Sim racing, photography, chess..."
        />
        <FieldError id="hobbies" message={state.fieldErrors?.hobbies} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="techStack">Known tech stack</Label>
        <Input
          id="techStack"
          name="techStack"
          aria-invalid={Boolean(state.fieldErrors?.techStack)}
          aria-describedby={state.fieldErrors?.techStack ? "techStack-error" : undefined}
          value={techStackValue}
          onChange={(e) => setTechStackValue(e.target.value)}
          placeholder="React, Node.js, Python"
        />
        <FieldError id="techStack" message={state.fieldErrors?.techStack} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="portfolioUrl">Portfolio</Label>
          <Input
            id="portfolioUrl"
            name="portfolioUrl"
            aria-invalid={Boolean(state.fieldErrors?.portfolioUrl)}
            aria-describedby={state.fieldErrors?.portfolioUrl ? "portfolioUrl-error" : undefined}
            value={portfolioUrlValue}
            onChange={(e) => setPortfolioUrlValue(e.target.value)}
            placeholder="https://..."
          />
          <FieldError id="portfolioUrl" message={state.fieldErrors?.portfolioUrl} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            aria-invalid={Boolean(state.fieldErrors?.linkedinUrl)}
            aria-describedby={state.fieldErrors?.linkedinUrl ? "linkedinUrl-error" : undefined}
            value={linkedinUrlValue}
            onChange={(e) => setLinkedinUrlValue(e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
          <FieldError id="linkedinUrl" message={state.fieldErrors?.linkedinUrl} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            aria-invalid={Boolean(state.fieldErrors?.githubUrl)}
            aria-describedby={state.fieldErrors?.githubUrl ? "githubUrl-error" : undefined}
            value={githubUrlValue}
            onChange={(e) => setGithubUrlValue(e.target.value)}
            placeholder="https://github.com/..."
          />
          <FieldError id="githubUrl" message={state.fieldErrors?.githubUrl} />
        </div>
      </div>
      <SubmitButton>Save changes</SubmitButton>
    </form>
  );
}
