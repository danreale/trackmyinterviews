import { Form, redirect, useLoaderData } from "react-router";
import { getUser } from "../../auth.server";
import { supabaseAdmin } from "../../supabase.server";
import type { Route } from "./+types/edit";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Edit Application" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");
  const { id } = params;

  const { data: application } = await supabaseAdmin
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.profile.id)
    .single();

  if (!application) return redirect(`/applications/${user.profile.id}`);

  return { application };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");
  const { id } = params;

  const formData = await request.formData();
  const company_name = formData.get("company_name");
  const job_title = formData.get("job_title");
  const url = formData.get("url");
  const date_applied = formData.get("date_applied");
  const status = formData.get("status");
  const salary = formData.get("salary");
  const location = formData.get("location");

  const { error } = await supabaseAdmin
    .from("applications")
    .update({
      company_name,
      job_title,
      url,
      date_applied,
      application_status: status,
      salary,
      location,
    })
    .eq("id", id)
    .eq("user_id", user.profile.id);

  if (error) {
    console.error("Error updating application:", error);
  }

  return redirect(`/applications/${user.profile.id}`);
}

export default function EditApplication({ loaderData }: Route.ComponentProps) {
  const { application } = loaderData;

  return (
    <main className="container mx-auto p-4 pt-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Application</h1>
      <Form method="post" className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            name="company_name"
            defaultValue={application.company_name}
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <input
            name="job_title"
            defaultValue={application.job_title}
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL</label>
          <input
            name="url"
            type="url"
            defaultValue={application.url}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date Applied
          </label>
          <input
            name="date_applied"
            type="date"
            required
            defaultValue={application.date_applied}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            defaultValue={application.application_status}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salary
          </label>
          <input
            name="salary"
            defaultValue={application.salary}
            placeholder="e.g. $120k"
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            name="location"
            defaultValue={application.location}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="on-site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Update Application
        </button>
      </Form>
    </main>
  );
}
