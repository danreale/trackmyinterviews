import { Link, redirect } from "react-router";
import { getUser } from "../auth.server";
import { supabaseAdmin } from "../supabase.server";
import type { Route } from "./+types/calendar";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Interview Calendar" }];
}

const GENERIC_DOMAINS = new Set([
  "gmail",
  "yahoo",
  "hotmail",
  "outlook",
  "icloud",
  "aol",
  "protonmail",
]);

function extractCompanyFromEmail(email: string): string | null {
  try {
    const domain = email.split("@")[1];
    if (!domain) return null;
    // Simple heuristic: take the first part of the domain (e.g. google.com -> google)
    const name = domain.split(".")[0];
    if (GENERIC_DOMAINS.has(name.toLowerCase())) return null;
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return null;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");

  // Fetch events from 1 year ago to ensure we get recent history + future
  // without getting stuck in the distant past due to pagination limits.
  const timeMin = new Date();
  timeMin.setFullYear(timeMin.getFullYear() - 1);

  const searchParams = new URLSearchParams({
    q: "interview",
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: timeMin.toISOString(),
    maxResults: "2500",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${searchParams}`,
    {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    }
  );

  if (response.status === 401 || response.status === 403) {
    return redirect("/logout");
  }

  if (!response.ok) {
    console.error("Failed to fetch calendar events:", await response.text());
    return { upcoming: [], past: [] };
  }

  const data = await response.json();
  const events = data.items || [];
  const now = new Date();

  // Fetch ratings from Supabase
  const { data: notes } = await supabaseAdmin
    .from("notes")
    .select("event_id, rating")
    .eq("user_id", user.profile.id);

  const ratingsMap = new Map(notes?.map((n) => [n.event_id, n.rating]) || []);

  const mappedEvents = events.map((event: any) => {
    const organizerEmail = event.organizer?.email;
    const isOrganizerSelf = organizerEmail === user.profile.email;
    const externalAttendees =
      event.attendees?.filter((a: any) => a.email !== user.profile.email) || [];

    let potentialCompany = null;

    // Try to extract company from organizer (if not self)
    if (!isOrganizerSelf && organizerEmail) {
      potentialCompany = extractCompanyFromEmail(organizerEmail);
    }

    // If not found, try external attendees
    if (!potentialCompany) {
      for (const att of externalAttendees) {
        if (att.email) {
          potentialCompany = extractCompanyFromEmail(att.email);
          if (potentialCompany) break;
        }
      }
    }

    return {
      id: event.id,
      userId: user.profile.id,
      company: event.summary,
      derivedCompany: potentialCompany,
      date: event.start.dateTime || event.start.date,
      rating: ratingsMap.get(event.id) || null,
      organizer: event.organizer?.displayName || event.organizer?.email,
      attendees: externalAttendees.map((a: any) => a.displayName || a.email),
    };
  });

  const upcoming = mappedEvents.filter((i: any) => new Date(i.date) > now);
  const past = mappedEvents
    .filter((i: any) => new Date(i.date) <= now)
    .reverse();

  return { upcoming, past };
}

export default function Calendar({ loaderData }: Route.ComponentProps) {
  const { upcoming, past } = loaderData;

  const renderSection = (title: string, interviews: typeof upcoming) => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-center">
        {title}
      </h2>
      {interviews.length === 0 ? (
        <p className="text-gray-500 italic">No interviews found.</p>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="border p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 bg-white"
            >
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-lg text-gray-600">
                  {interview.company}
                </h3>
                {interview.derivedCompany && (
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-1 mb-1">
                    {interview.derivedCompany}
                  </span>
                )}
                <p className="text-gray-600">
                  {new Date(interview.date).toLocaleString()}
                </p>
                {interview.organizer && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-semibold">Organizer:</span>{" "}
                    {interview.organizer}
                  </p>
                )}
                {interview.attendees.length > 0 && (
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Attendees:</span>{" "}
                    {interview.attendees.join(", ")}
                  </p>
                )}
                <div className="mt-1 text-xl" title="Interview Rating">
                  {!interview.rating && "❓"}
                  {interview.rating === "thumbs-down" && "👎"}
                  {interview.rating === "thumbs-up" && "👍"}
                  {interview.rating === "strong-thumbs-up" && "👍👍"}
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/notes/${interview.userId}/${interview.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  Notes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <main className="container mx-auto p-4 pt-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">My Calendar</h1>
      {renderSection("Upcoming Interviews", upcoming)}
      {renderSection("Past Interviews", past)}
    </main>
  );
}
