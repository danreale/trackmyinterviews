import { Form, Link } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { getUser } from "../auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Interview Tracker App" },
    {
      name: "description",
      content: "Track Interview Notes with your Google account!",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="flex flex-col items-center pb-10">
      {user ? (
        <div className="flex flex-col items-center gap-2">
          <Link
            to={`/calendar/${user.profile.id}`}
            className="mt-4 text-blue-600 hover:underline"
          >
            View Calendar
          </Link>
          <Form action="/logout" method="post">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Logout
            </button>
          </Form>
        </div>
      ) : (
        <Form action="/auth/google" method="post">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login with Google
          </button>
        </Form>
      )}
    </div>
  );
}
