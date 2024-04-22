import { ActionFunctionArgs, LoaderFunctionArgs, redirect, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { authenticator } from "~/services/auth.server";
import type ProfileType from "~/types/profile";
import { db } from "~/utils/db.server";


// action function has two options for updating the Bio and Name or the profile picture
// the first option is to update the bio and name

export async function action({ request }: ActionFunctionArgs) {
    // get the user data
    let user = await authenticator.isAuthenticated(request);
    if (!user) { return redirect("/login") }

    // check if the request is a multipart form data or not
    if (request.headers.get("Content-Type")?.includes("multipart/form-data")) {

      const uploadHandler = unstable_composeUploadHandlers(
        unstable_createFileUploadHandler({
          maxPartSize: 5_000_000,
          file: ({ filename }) => filename,
          directory: "./public/assets/profilePictures",
        })
      );
      
      const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler
      );

      let img = formData.get("profilePicture") as unknown as { filename: string, filepath: string };

      let pathToImage = img.filepath.toString().split('/').slice(-3).join('/');
      //save the profile picture in the db
      await db.profile.update({
        where: {
          id: user.id,
        },
        data: {
          profilePicture: pathToImage
        },
      });

    } else {
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
    }

    //refresh the page
    return redirect("/profile");
}


export async function loader({ request }: LoaderFunctionArgs) {

    // get the user data or redirect to /login if it failed
    let user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
      });

      // get the profile data from the db
      const profile = await db.profile.findUnique({
        where: {
          id: user.id,
        },
      });
    
      // return the user data
      return profile as ProfileType;
  };


export default function Profile() {
    let user = useLoaderData() as ProfileType;

    let [areSettingsVisible, setAreSettingsVisible] = React.useState(false);
    let [IsUpdateProfilePictureVisible, setIsUpdateProfilePictureVisible] = React.useState(false);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="max-w-md mx-auto rounded-lg overflow-hidden">
          <div className="flex justify-center">
            <figure className="relative">
              <img className="w-32 h-32 rounded-full object-cover" src={user.profilePicture} alt="Profile Picture" />
              <button onClick={()=> setIsUpdateProfilePictureVisible(true) } className="absolute bottom-0 right-0 rounded-full p-1 text-2xl">⚙️</button>
            </figure>
          </div>
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold mb-2">{user.name}</h2>
            <p className="">{user.bio}</p>
          </div>
        </div>
          <button onClick={() => setAreSettingsVisible(!areSettingsVisible)} className="block text-white mt-8 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
          Settings
        </button>
      </div>

      {areSettingsVisible && (
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative p-4 w-full max-w-xl max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Uredi svoj profil
                </h3>
                <button type="button" onClick={() => setAreSettingsVisible(!areSettingsVisible)} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5">
                <form className="space-y-4" method="post" >
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ime</label>
                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" defaultValue={user.name} required />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Opis</label>
                    <textarea name="bio" id="bio" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" defaultValue={user.bio} rows={8} />
                  </div>
                  <button className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="submit" >
                    Update</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      { IsUpdateProfilePictureVisible && (
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative p-4 w-full max-w-xl max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Uredi svoju profilnu
                </h3>
                <button type="button" onClick={()=> setIsUpdateProfilePictureVisible(false) } className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5">
                <Form className="space-y-4" method="post" encType="multipart/form-data" >
                  <div>
                    <label htmlFor="profilePicture" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ime</label>
                    <input type="file" name="profilePicture" id="profilePicture" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                  </div>
                  
                  <button className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="submit" >
                    Update</button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}