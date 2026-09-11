import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { SettingsModel, SETTINGS_SINGLETON_ID, type Settings } from "@/models/Settings";

export async function getSettings(): Promise<Settings> {
  await connectToDatabase();
  const existing = await SettingsModel.findById(SETTINGS_SINGLETON_ID).lean();
  if (existing) return existing;

  const created = await SettingsModel.create({ _id: SETTINGS_SINGLETON_ID });
  return created.toObject();
}
