import { redirect } from "react-router";
import { getGoogleUser } from "../../../auth.server";
import { getSession, commitSession } from "../../../sessions";
import type { Route } from "./+types/auth/google/callback";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/");
  }

  // Exchange code for user info
  const user = await getGoogleUser(code);

  const session = await getSession(request.headers.get("cookie"));
  session.set("user", user);

  return redirect(`/calendar/${user.profile.id}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
