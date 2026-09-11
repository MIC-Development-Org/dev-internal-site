import { redirect } from "next/navigation";

// The sign-in page has been consolidated at the root ("/").
// This redirect ensures any old bookmarks or OAuth callbacks still work.
export default function LoginPage() {
  redirect("/");
}
