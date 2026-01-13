import { redirect } from "react-router";
import { getSession } from "./sessions";

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || "").trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
const CALLBACK_URL = (
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5173/auth/google/callback"
).trim();

if (!GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID env var");
if (!GOOGLE_CLIENT_SECRET)
  throw new Error("Missing GOOGLE_CLIENT_SECRET env var");

export async function getUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("user");
}

export function getGoogleAuthURL() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    response_type: "code",
    scope:
      "openid email profile https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function getGoogleUser(code: string) {
  // 1. Exchange code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();
  if (!tokens.access_token) throw new Error("Failed to get tokens");

  // 2. Get User Profile
  const profileResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  );
  const profile = await profileResponse.json();

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    profile: {
      id: profile.id,
      displayName: profile.name,
      email: profile.email,
      photo: profile.picture,
    },
  };
}
