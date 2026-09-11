import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Singleton document (fixed _id) holding department-wide config.
export const SETTINGS_SINGLETON_ID = "settings";

const settingsSchema = new Schema({
  _id: { type: String, default: SETTINGS_SINGLETON_ID },
  teamFormationDeadline: { type: Date, default: null },
  formationPhaseOpen: { type: Boolean, default: true },
});

export type Settings = InferSchemaType<typeof settingsSchema>;

export const SettingsModel: Model<Settings> =
  models.Settings ?? model<Settings>("Settings", settingsSchema);
