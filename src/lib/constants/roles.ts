// Mongoose-free constants so client components can import them without
// pulling the mongoose/mongodb driver (and its Node-only builtins) into the browser bundle.
export const USER_ROLES = ["lead", "senior", "fresher"] as const;
export type UserRole = (typeof USER_ROLES)[number];
