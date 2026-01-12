import { Link } from "react-router";
import type { Route } from "./+types/calendar";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Interview Calendar" }];
}

// Mock data for interviews
const INTERVIEWS = [
  {
    id: "abc",
    userId: "123",
    company: "Tech Corp",
    date: "2025-12-25T10:00:00Z",
    rating: "thumbs-up",
  },
  {
    id: "def",
    userId: "123",
    company: "Startup Inc",
    date: "2026-02-15T14:00:00Z",
    rating: "strong-thumbs-up",
  },
  {
    id: "ghi",
    userId: "123",
    company: "Legacy Systems",
    date: "2023-11-01T09:00:00Z",
    rating: "thumbs-down",
  },
];

export function loader({ params }: Route.LoaderArgs) {
  const { userId } = params;
  const now = new Date();
  const userInterviews = INTERVIEWS.filter((i) => i.userId === userId);
  const upcoming = userInterviews.filter((i) => new Date(i.date) > now);
  const past = userInterviews.filter((i) => new Date(i.date) <= now);
  return { upcoming, past };
}

export default function Calendar({ loaderData }: Route.ComponentProps) {
  const { upcoming, past } = loaderData;

  const renderSection = (title: string, interviews: typeof upcoming) => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">{title}</h2>
      {interviews.length === 0 ? (
        <p className="text-gray-500 italic">No interviews found.</p>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="border p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white"
            >
              <div>
                <h3 className="font-bold text-lg text-gray-600">
                  {interview.company}
                </h3>
                <p className="text-gray-600">
                  {new Date(interview.date).toLocaleString()}
                </p>
                <div className="mt-1 text-xl" title="Interview Rating">
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
