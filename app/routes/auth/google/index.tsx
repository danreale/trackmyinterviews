import { redirect } from "react-router";
import { getGoogleAuthURL } from "../../../auth.server";
import type { Route } from "./+types/index";

export async function action({ request }: Route.ActionArgs) {
  return redirect(getGoogleAuthURL());
}
