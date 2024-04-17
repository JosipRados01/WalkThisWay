import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { authenticator } from "~/services/auth.server";
import type ProfileType from "~/types/profile";
import { db } from "~/utils/db.server";


// action function has two options for updating the Bio and Name or the profile picture
// the first option is to update the bio and name

export async function action({ request }: LoaderFunctionArgs) {
    // get the user data
    let user = await authenticator.isAuthenticated(request);
    if (!user) { return redirect("/login") }
    // get the form data
    let formData = await request.formData();
    // get the bio and name from the form data
    let bio = formData.get("bio") as string;
    let name = formData.get("name") as string;

    // update the user data in the db
    await db.profile.update({
      where: {
        id: user.id,
      },
      data: {
        bio,
        name,
      },
    });

    //update the session data
    

    //refresh the page
    return redirect("/profile");
}


export async function loader({ request }: LoaderFunctionArgs) {

    // get the user data or redirect to /login if it failed
    let user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
      });
    
      // return the user data
      return user;
  };


export default function Profile() {
    let user = useLoaderData() as ProfileType;
    console.log(user);

    let [areSettingsVisible, setAreSettingsVisible] = React.useState(false);

  return (
    <>
    <div className="flex justify-end absolute top-20 right-0">
      <button onClick={() => setAreSettingsVisible(!areSettingsVisible)} className="bg-gray-200 p-2 rounded-lg mt-4">Settings</button>
    </div>
    <div className="flex flex-col items-center">
      <div className="max-w-md mx-auto rounded-lg overflow-hidden">
        <div className="flex justify-center">
          <img className="w-32 h-32 mt-8 rounded-full" src={user.profilePicture} alt="Profile Picture" />
        </div>
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold mb-2">{user.name}</h2>
          <p className="">{user.bio}</p>
        </div>
      </div>
    </div>

    {areSettingsVisible && (
      <form action="/profile" method="post" encType="multipart/form-data">
        <div className="flex flex-col items-center">
          <label htmlFor="name" className="mt-4">Name</label>
          <input type="text" name="name" id="name" defaultValue={user.name} className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-transparent" />
          <label htmlFor="bio" className="mt-4">Bio</label>
          <textarea name="bio" id="bio" defaultValue={user.bio} className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-transparent" />
          <button type="submit" className="border border-gray-300 p-2 rounded-lg mt-4">Update</button>
        </div>
      </form>
    )}
    
    </>
  );
}