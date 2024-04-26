import { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";

export async function loader({ params } : LoaderFunctionArgs ) {
  const articleId = parseInt(params.articleId as string);
  const comments = await db.article.findUnique({
    where: { id: articleId },
    select: { 
      comments: {
        select: {
          id: true,
          content: true,
          parentCommentId: true,
          createdAt: true,
          writer: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          },
          writerId: true,
          articleId: true
        } 
      }
    }
  })

  return comments;
}
