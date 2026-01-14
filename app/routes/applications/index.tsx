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
    .order("date_applied", { ascending: false })
    .order("created_at", { ascending: false });

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
      <div className="relative flex flex-col sm:flex-row items-center sm:justify-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <Link
          to="/applications/add"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 w-full sm:w-auto text-center font-medium shadow-sm transition-all sm:absolute sm:right-0"
        >
          Add Application
        </Link>
      </div>

      {/* Mobile View */}
      <div className="md:hidden grid gap-4">
        {applications.map((app: any) => (
          <div
            key={app.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 text-center"
          >
            <div>
              <span className="shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full mb-2 inline-block">
                {new Date(app.date_applied).toLocaleDateString()}
              </span>
              <h3 className="font-bold text-xl text-gray-900 leading-snug">
                {app.company_name}
              </h3>
              <p className="text-gray-600 font-medium mt-0.5">
                {app.job_title}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-y-2 gap-x-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">📍</span>
                <span className="capitalize">{app.location}</span>
              </div>
              {app.salary && (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">💰</span>
                  <span>{app.salary}</span>
                </div>
              )}
            </div>

            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <span className="text-blue-400">🔗</span> View Job Description
              </a>
            )}

            <div className="w-full flex flex-col items-center gap-3">
              <Form
                method="post"
                onChange={(e) => submit(e.currentTarget)}
                className="w-full"
              >
                <input type="hidden" name="id" value={app.id} />
                <div className="relative">
                  <select
                    name="status"
                    defaultValue={app.application_status}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 font-medium text-center"
                    aria-label="Application Status"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </Form>
              <Link
                to={`/applications/${app.id}/edit`}
                className="text-gray-500 hover:text-blue-600 p-2.5 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                aria-label="Edit"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
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
      </div>
      {applications.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No applications tracked yet.
        </p>
      )}
    </main>
  );
}
