import { Form, Link, redirect, useSubmit } from "react-router";
import { getUser } from "../../auth.server";
import { supabaseAdmin } from "../../supabase.server";
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Applications" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");

  if (params.userId !== user.profile.id)
    return redirect(`/applications/${user.profile.id}`);

  const { data: applications, error } = await supabaseAdmin
    .from("applications")
    .select("*")
    .eq("user_id", user.profile.id)
    .order("date_applied", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return { applications: [] };
  }

  return { applications };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/");

  const formData = await request.formData();
  const id = formData.get("id");
  const status = formData.get("status");

  if (typeof id === "string" && typeof status === "string") {
    await supabaseAdmin
      .from("applications")
      .update({ application_status: status })
      .eq("id", id)
      .eq("user_id", user.profile.id);
  }

  return null;
}

export default function Applications({ loaderData }: Route.ComponentProps) {
  const { applications } = loaderData;
  const submit = useSubmit();

  return (
    <main className="container mx-auto p-4 pt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <Link
          to="/applications/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Application
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Company
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Job Title
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Job Description
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Date Applied
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Location
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Salary
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app: any) => (
              <tr
                key={app.id}
                className="border-b hover:bg-gray-50 text-gray-600"
              >
                <td className="py-3 px-4">{app.company_name}</td>
                <td className="py-3 px-4">{app.job_title}</td>
                <td className="py-3 px-4">
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Form method="post" onChange={(e) => submit(e.currentTarget)}>
                    <input type="hidden" name="id" value={app.id} />
                    <select
                      name="status"
                      defaultValue={app.application_status}
                      className="border rounded px-2 py-1 text-sm bg-white cursor-pointer"
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </Form>
                </td>
                <td className="py-3 px-4">
                  {new Date(app.date_applied).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 capitalize">{app.location}</td>
                <td className="py-3 px-4">{app.salary || "-"}</td>
                <td className="py-3 px-4">
                  <Link
                    to={`/applications/${app.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No applications tracked yet.
          </p>
        )}
      </div>
    </main>
  );
}
