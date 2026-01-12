import { useEffect, useRef } from "react";
import {
  Form,
  redirect,
  useNavigation,
  useParams,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/notes";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Notes" }];
}

// Mock notes data
const MOCK_NOTES = [
  {
    id: 1,
    userId: "123",
    interviewId: "abc",
    content: "Need to research the company values.",
    createdAt: "2023-10-20T10:00:00Z",
    rating: "thumbs-up",
  },
  {
    id: 2,
    userId: "123",
    interviewId: "def",
    content: "Prepare for system design questions.",
    createdAt: "2023-10-21T14:30:00Z",
    rating: "strong-thumbs-up",
  },
];

export async function loader({ params }: Route.LoaderArgs) {
  const { userId, interviewId } = params;
  const note = MOCK_NOTES.find(
    (n) => n.userId === userId && n.interviewId === interviewId
  );
  return { note };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const note = formData.get("note");
  const rating = formData.get("rating");
  const { userId, interviewId } = params;

  // TODO: Add logic here to save 'note' to your database (e.g., Prisma, Drizzle, etc.)
  console.log(
    `Note submitted for user ${userId}, interview ${interviewId}:`,
    note,
    `Rating: ${rating}`
  );

  return redirect(`/calendar/${userId}`);
}

export default function Notes() {
  const { note } = useLoaderData<typeof loader>();
  const { userId, interviewId } = useParams();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note, interviewId]);

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold">
        Notes for User {userId}, Interview {interviewId}
      </h1>

      <Form
        method="post"
        className="mt-4 flex flex-col gap-4 max-w-lg"
        key={interviewId}
      >
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              value="thumbs-down"
              defaultChecked={note?.rating === "thumbs-down"}
            />
            <span className="text-xl">👎</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              value="thumbs-up"
              defaultChecked={note?.rating === "thumbs-up" || !note}
            />
            <span className="text-xl">👍</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              value="strong-thumbs-up"
              defaultChecked={note?.rating === "strong-thumbs-up"}
            />
            <span className="text-xl">👍👍</span>
          </label>
        </div>
        <textarea
          ref={textareaRef}
          name="note"
          placeholder={note ? undefined : "Write your note here..."}
          defaultValue={note?.content}
          className="border p-2 rounded-md min-h-[8.5rem]"
          rows={5}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 self-start disabled:bg-blue-400"
        >
          {isSubmitting ? "Submitting..." : "Submit Note"}
        </button>
      </Form>
    </main>
  );
}
