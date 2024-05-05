import { Outlet, LiveReload, Link, Scripts, Meta, ScrollRestoration, useLoaderData } from "@remix-run/react";
import React from "react";
import globalCSS from "~/styles/global.css";
import { authenticator } from "~/services/auth.server";


export default function App () {
  return (
    <Document title={"WTW"}>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  )
}

interface DocumentProps {
  title: string
  children: React.ReactNode
}

interface DocumentProps {
  title: string;
  children: React.ReactNode;
}

function Document ({ children, title }: DocumentProps) {
  return (
    <html lang="bs">
      <head>
        <link rel="stylesheet" href={globalCSS} />
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link href="https://fonts.googleapis.com/css2?family=New+Rocker&display=swap" rel="stylesheet"></link>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"/>
        <title>Walk this way</title>
        <meta charSet="utf-8" />
        <Meta/>
      </head>
      <body className="bg-black text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
        { process.env.NODE_ENV === "development" && <LiveReload /> }
      </body>
    </html>
  );
}

import wtwLogo from "~/images/wtw_logo_t.png";
import { LoaderFunctionArgs } from "@remix-run/node";

//loader function
export async function loader({ request }: LoaderFunctionArgs) {
  //check if the user is authenticated
  let user = await authenticator.isAuthenticated(request);
  return user;
}

import ProfileAuthFragment from "./types/profileAuthFragment";

function Layout({ children }: { children: React.ReactNode }) {

  const links = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/articles" },
    //{ name: "Events", url: "/events" },
    { name: "About us", url: "/about" },
  ];

  // display different links based on the user role and if the user is logged in
  let user = useLoaderData() as ProfileAuthFragment | null; 
  if (user) {
    links.push({ name: "Profile", url: "/profile" });
    if (user.role === "admin") {
      links.push({ name: "Admin", url: "/admin" });
      links.push({ name: "Publish", url: "/publish" });
    }
    if(user.role === "publisher") {
      links.push({ name: "Publish", url: "/publish" });
    }
    links.push({ name: "Logout", url: "/logout" });
  } else {
    links.push({ name: "Login", url: "/login" });
    links.push({ name: "Register", url: "/register" });
  }
  return (
    <>
      <nav className="flex flex-space-between h-20 fixed top-0 left-0 right-0 header-nav-background text-white z-10 rocker ">
        <figure className="ps-5">
          <Link to="/">
            <figure className="w-20"> <img src={wtwLogo} alt="Remix Logo" /> </figure>
          </Link>
        </figure>
        <ul className="flex space-x-5 pe-5">
          {links.map((link) => (
            <li key={link.url} className="padding-20">
              <Link to={link.url}>{link.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="pt-20"/>
      {children}
    </>
  );
}