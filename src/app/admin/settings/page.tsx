import { getSettings } from "@/lib/data/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Team formation</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            deadlineIso={settings.teamFormationDeadline ? settings.teamFormationDeadline.toISOString() : null}
            formationPhaseOpen={settings.formationPhaseOpen}
          />
        </CardContent>
      </Card>
    </div>
  );
}
