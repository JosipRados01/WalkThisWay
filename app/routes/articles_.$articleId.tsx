import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export function loader({ params }:LoaderFunctionArgs) {
  return { articleId: params.articleId };
}

function Article() {
 const data: { articleId:string } = useLoaderData();

  return (
    <div>
      <h1>Article some aloooo { data.articleId }</h1>
    </div>
  );
}

export default Article;