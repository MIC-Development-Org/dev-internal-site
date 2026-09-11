import { getDirectory } from "@/lib/data/users";
import { DirectoryView } from "./directory-view";

export default async function DirectoryPage() {
  // Fetch all members without applying server-side filters.
  // The DirectoryView client component will handle the live filtering.
  const members = await getDirectory();

  return <DirectoryView initialMembers={members} />;
}
