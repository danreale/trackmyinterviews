import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("notes/:userId/:interviewId", "routes/notes.tsx"),
  route("calendar/:userId", "routes/calendar.tsx"),
] satisfies RouteConfig;
