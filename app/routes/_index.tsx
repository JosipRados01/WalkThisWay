import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import headerImage from "~/images/naslovna.jpg";
import { Hero } from "~/components/Hero";
import { Carousel } from "~/components/Carousel";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export type Article = {
  id: number;
  cover: string;
  title: string;
  content: string;
};

type Category = {
  id: number;
  name: string; 
  articles: Article[];
}


export const loader: LoaderFunction = async () => {
  const articles = await db.article.findMany({
    select: {
      id: true,
      cover: true,
      title: true,
      content: true,
    },
    take: 3, // Select only 3 articles
  }) as Article[];

  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      articles: {
        select: {
          id: true,
          title: true,
          content: true,
        },
        take: 10, // Select only 10 articles
      },
    }
  }) as Category[];

  // generate the cover urls for the articles and the articles in the categories
  articles.forEach(article => article.cover = `./assets/articleImages/${article.id}/cover.jpeg`);
  categories.forEach(category => category.articles.forEach(article => article.cover = `./assets/articleImages/${article.id}/cover.jpeg`));

  return { articles, categories } as indexData;
};

type indexData = {
  articles: Article[];
  categories: Category[];
}

export default function Index() {
  let { articles, categories } = useLoaderData<indexData>() as indexData;

  return (
    <>
    <Hero cover={ headerImage } title={ "Walk This Way" } content={ "Heavy metal i Rock Magazin" } />
    <ChosenArticles articles={ articles } />
    <GigsNearYou/>
    <Categories categories={ categories }/>
    <Registration/>
    <Footer/>
    </>
  );
}

/** @todo: create the elements for the home page: 
 * 1. hero section with paralax image and a cool header and quote
 * 2. chosen articles section with 3 articles
 * 3. svirke blizu tebe block
 * 4. categories block wih netflix style carousel
 * 5. become a member block with small about us text and registration form
 * 6. footer with links to social media and contact form
*/



function ArticleCard({id, title, content}: Article) {
  return (
    <div className="flex flex-col p-5 border w-3/4 lg:w-1/3 xl:w-1/4 m-10 aspect-square">
      <Link to={`http://localhost:3000/articles/${id}`}>
        <img src={`./assets/articleImages/${id}/cover.jpeg`} alt="" className="aspect-square pb-5 object-cover" />
        <h2 className="text-xl font-bold mb-3 line-clamp-2">{title}</h2>
        <p className="line-clamp-3">{content}</p>
      </Link>
    </div>
  )
}
  

function ChosenArticles( { articles }: {articles:Article[]} ) {
  return (
    <div className="flex flex-wrap flex-center min-h-screen p-20">
      {articles.map((article) => <ArticleCard {...article} />)}
    </div>
  )
}

import mapImage from "~/images/map.jpeg";

function GigsNearYou() {
  return (
    <div className="relative flex-column flex-center h-screen text-white text-center rocker overflow-hidden">
      <img src={mapImage} alt="" className="parallaxImage h-screen w-full object-cover dark-filter" />
      <div className="absolute-center text-shadow bg-shadow p-10 rounded-2xl">
        <h1 className="text-7xl pb-5">Svirke blizu tebe</h1>
        <p>Koristi našu interaktivnu mapu da pogledas svrirke blizu tebe</p>
      </div>
    </div>
  )
}




function Categories({categories}: {categories:Category[]}) {
  return (
    <div>
      {categories.map((category) => <Carousel {...category} />)}
    </div>
  )
}

function SignUpForm() {
  return (
    <form className="w-3/6">
    <div className="relative z-0 w-full mb-6 group">
      <input type="text" name="floating_first_name" id="floating_first_name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
      <label htmlFor="floating_first_name" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
        Korisničko ime</label>
    </div>
      <div className="relative z-0 w-full mb-6 group">
        <input type="email" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label htmlFor="floating_email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Email adresa</label>
      </div>
      <div className="relative z-0 w-full mb-6 group">
        <input type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label htmlFor="floating_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          lozinka</label>
      </div>
      <div className="relative z-0 w-full mb-6 group">
        <input type="password" name="repeat_password" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label htmlFor="floating_repeat_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Ponovite lozinku</label>
      </div>
      <div className="flex flex-center">
      <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Registruj se</button>
        </div>
    </form>
  );
}

function Registration() {
  return (
  <div className="flex flex-col md:flex-row flex-space-around p-20">
    <article className=" md:w-2/6 pb-20">
    <h2 className="text-4xl pb-5">Postani član</h2>
    <p>
      Postani član i prati najnovije vijesti iz svijeta rock i metal muzike
      Walk this way je pokrenunt od strane nasih clanova. 
      Ako zelis da postanes novinar i pises clanke za nas, javi nam se na email. 
      Ako zelis da postanes clan i da dobijas obavjestenja o najnovijim clanacima,
      popuni formu ispod.
    </p>
    </article>

    <SignUpForm/>
  </div>
  )
}

function Footer() {
  return (
    <footer className="">
      <div className="flex flex-row flex-space-around pb-20">
        <div className="">
          <h3 className="text-2xl">Walk this way</h3>
          <p>Heavy metal i Rock Magazin</p>
          <h3 className="text-xl pt-10">Kontakt</h3>
          <p>email: walkthiswaystranica@gmail.com </p>
          <p>telefon: 063/294-805 </p>
        </div>
        <div className="">
          <h3 className="text-2xl">Pratite nas</h3>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>Twitter</p>
        </div>
      </div>
      <div className="flex flex-space-around flex-row pb-5">
        <p>© 2021 Walk this way</p>
        <p>Polica privatnosti</p>
        <p>Uslovi korištenja</p>
      </div>
    </footer>
  )
}