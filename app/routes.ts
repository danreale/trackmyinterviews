import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("notes/:userId/:eventId", "routes/notes.tsx"),
  route("calendar/:userId", "routes/calendar.tsx"),
  route("auth/google", "routes/auth/google/index.tsx"),
  route("auth/google/callback", "routes/auth/google/callback.tsx"),
  route("logout", "routes/logout.tsx"),
  route("applications/:userId", "routes/applications/index.tsx"),
  route("applications/add", "routes/applications/add.tsx"),
  route("applications/:id/edit", "routes/applications/edit.tsx"),
] satisfies RouteConfig;
