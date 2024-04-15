import { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    await authenticator.logout(request, { redirectTo: "/login" });
};

export async function action({ request }: ActionFunctionArgs) {
    await authenticator.logout(request, { redirectTo: "/login" });
};