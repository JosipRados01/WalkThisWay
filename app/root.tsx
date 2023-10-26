import { Outlet, LiveReload, Link } from "@remix-run/react";
import React from "react";
import globalCSS from "~/styles/global.css";

const links = [
  { name: "Home", url: "/" },
  { name: "Articles", url: "/articles" },
  { name: "Events", url: "/events" },
  { name: "Categories", url: "/categories" },
  { name: "About us", url: "/about" },
  { name: "Contact", url: "/contact" },
];

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
        <title>Walk this way</title>
        <meta charSet="utf-8" />
      </head>
      <body className="bg-black text-white">
        {children}
        { process.env.NODE_ENV === "development" && <LiveReload /> }
      </body>
    </html>
  );
}

import wtwLogo from "~/images/wtw_logo.jpg";

function Layout({ children }: { children: React.ReactNode }) {
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