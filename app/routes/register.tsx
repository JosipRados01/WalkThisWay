import { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node"; 
import { db } from "~/utils/db.server";


export async function action({ request }: ActionFunctionArgs) {
    //register by getting all the data from the form
    let formData = await request.formData();
    console.log(formData);
    let email = formData.get("floating_email")?.toString();
    let password = formData.get("floating_password")?.toString();
    let repeatPassword = formData.get("floating_repeat_password")?.toString();
    let name = formData.get("floating_first_name")?.toString();

    console.log(email, password, repeatPassword, name);

    //check if the passwords match
    if (password == repeatPassword) {
        //register the user
        await db.profile.create({
            data: {
                email: email as string,
                password: password as string,
                name: name as string,
                role: "user",
                profilePicture: "https://picsum.photos/200" //default profile picture
            }
        });

        //redirect to login
        return redirect("/login");
    }

    return null
};

export default function Register() {

    return (
        <div>
            <form method="post" className="flex flex-col items-center">
                <input
                    type="text"
                    name="floating_first_name"
                    required
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-transparent"
                    placeholder="First Name"
                />
                <input
                    type="email"
                    name="floating_email"
                    required
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-transparent"
                    placeholder="Email"
                />
                <input
                    type="password"
                    name="floating_password"
                    required
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-transparent"
                    placeholder="Password"
                />
                <input
                    type="password"
                    name="floating_repeat_password"
                    required
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-transparent"
                    placeholder="Repeat Password"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Register
                </button>
            </form>
        </div>
    )
}