import { useEffect, useRef } from "react";
import {
  Form,
  redirect,
  useNavigation,
  useParams,
  useLoaderData,
} from "react-router";
import { getUser } from "../auth.server";
import { supabaseAdmin } from "../supabase.server";
import type { Route } from "./+types/notes";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Notes" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");

  const { userId, eventId } = params;
  if (user.profile.id !== userId) return redirect("/");

  const { data } = await supabaseAdmin
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  return { note: data };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");

  const formData = await request.formData();
  const note = formData.get("note");
  const rating = formData.get("rating");
  const { userId, eventId } = params;
  if (user.profile.id !== userId) return redirect("/");

  const { error } = await supabaseAdmin.from("notes").upsert(
    {
      user_id: userId,
      event_id: eventId,
      note: note,
      rating: rating,
    },
    { onConflict: "user_id, event_id" }
  );

  if (error) {
    console.error("Error saving note:", error);
    throw new Response("Failed to save note", { status: 500 });
  }

  return redirect(`/calendar/${userId}`);
}

export default function Notes() {
  const { note } = useLoaderData<typeof loader>();
  const { userId, eventId } = useParams();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note, eventId]);

  return (
    <main className="container mx-auto p-4 pt-16 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center">Add Interview Notes</h1>

      <Form
        method="post"
        className="mt-4 flex flex-col gap-4 w-full max-w-2xl"
        key={eventId}
      >
        <div className="flex gap-6 justify-center">
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
          defaultValue={note?.note}
          className="border p-2 rounded-md min-h-[16rem]"
          rows={10}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        <input type="text" hidden defaultValue={userId} />
        <input type="text" hidden defaultValue={eventId} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 self-center disabled:bg-blue-400"
        >
          {isSubmitting ? "Submitting..." : "Submit Note"}
        </button>
      </Form>
    </main>
  );
}
