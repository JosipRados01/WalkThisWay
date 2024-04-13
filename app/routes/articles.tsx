
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {db} from '~/utils/db.server'
import type { Prisma } from '@prisma/client';
import { Carousel } from "~/components/Carousel";

type Article = Prisma.ArticleGetPayload<{
  include: {
    category: true;
  };
}>;

type Categories = {
  [key: string]: Article[];
};

export async function loader() {
  const articles = await db.article.findMany({
    include: {
      category: true
    }
  });
  const categories: Categories = articles.reduce((acc: Categories, article) => {
    const category = article.category?.name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [] as Article[];
    }
    acc[category].push(article);
    return acc;
  }, {});

  return categories ;
}

function Articles() {
  let categories = useLoaderData<Categories>();

  //for content use the first paragraph of each article and remove the "pa:" from the string
  Object.entries(categories).forEach(([category, articles]) => {
    return articles.forEach(article => {
      let content = article.content.split("||")
      let firstParagraph = content.find((str) => str.startsWith("pa:"));
      //remove the "pa:" from the string
      if(firstParagraph) {
        firstParagraph = firstParagraph.replace("pa:", "");
      }
      //if there is no paragraph, use the first text
      else 
        firstParagraph = content[0];

      article.content = firstParagraph;
    })
  })
  
  return (
    <div>
      <h1>Categories</h1>
      <p> Walk this way sadrzi mnogo sadržaja. Najlakše pronadji što te zanima kroz naše kategorije:</p>
      
      {Object.entries(categories).map(([category, articles]) => (
        <div key={category} className="pb-20">
          <Carousel title={category} articles={articles} />
        </div>
      ))}
    </div>
  );
}

export default Articles;