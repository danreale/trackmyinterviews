import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Interview Tracker App" },
    {
      name: "description",
      content: "Track Interview Notes with your Google account!",
    },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center pb-10">
      <Link to="/calendar/123" className="mt-2 text-blue-600 hover:underline">
        View Calendar
      </Link>
    </div>
  );
}
