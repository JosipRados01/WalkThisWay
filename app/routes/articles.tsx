
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {db} from '~/utils/db.server'
import type { Prisma } from '@prisma/client';

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
  const categories = useLoaderData<Categories>();

  return (
    <div>
      <h1>All articles</h1>
      {Object.entries(categories).map(([category, articles]) => (
        <div key={category} className="pb-20">
          <h2>{category}</h2>
          <div className="flex">
          {articles.map((article) => (
            <div key={article.id} className="max-w-lg">
              <h3>{article.title}</h3>
              <p>{article.content}</p>
            </div>
          ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Articles;