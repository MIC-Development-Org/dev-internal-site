"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="batch">Batch / Year</Label>
        <Input
          id="batch"
          name="batch"
          value={batchValue}
          onChange={(e) => setBatchValue(e.target.value)}
          placeholder="e.g. 2nd Year, 2027"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hobbies">Hobbies</Label>
        <Textarea
          id="hobbies"
          name="hobbies"
          value={hobbiesValue}
          onChange={(e) => setHobbiesValue(e.target.value)}
          rows={3}
          placeholder="Sim racing, photography, chess..."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="techStack">Known tech stack</Label>
        <Input
          id="techStack"
          name="techStack"
          value={techStackValue}
          onChange={(e) => setTechStackValue(e.target.value)}
          placeholder="React, Node.js, Python"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="portfolioUrl">Portfolio</Label>
          <Input
            id="portfolioUrl"
            name="portfolioUrl"
            value={portfolioUrlValue}
            onChange={(e) => setPortfolioUrlValue(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            value={linkedinUrlValue}
            onChange={(e) => setLinkedinUrlValue(e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            value={githubUrlValue}
            onChange={(e) => setGithubUrlValue(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
      </div>
      <SubmitButton>Save changes</SubmitButton>
    </form>
  );
}
