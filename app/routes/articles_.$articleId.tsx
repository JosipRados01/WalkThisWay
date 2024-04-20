import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Carousel } from "~/components/Carousel";
import { Hero } from "~/components/Hero";
import { db } from "~/utils/db.server";


export async function loader({ params, request }: LoaderFunctionArgs) {
  // fetch article with article id
  // fetch likes for article with article id
  // fetch category with category id, and articles for that category
  // fetch comments for article with article id

  // fetch article with article id
  const article = await db.article.findUnique({
    where: {
      id: Number(params.articleId),
    },
    select: {
      title: true,
      content: true,
      categoryId: true,
      likes: true,
      comments: {
        select: {
          id: true,
          content: true,
          parentCommentId: true,
          writer: {
            select: {
              name: true,
              profilePicture: true,
            },
          },
        },
      },
      eventTime: true,
      createdAt: true,
      writer: true,
      category: {
        select: {
          name: true,
          articles: {
            take: 15, // Limit to 15 articles
            select: {
              id: true,
              title: true,
              content: true,
            },
          },
        },
      },
    },
  });

  if (article) {
    //reformat the comments to have children
    const commentsWithChildren: Comment[] = article.comments
      .map(comment => {
        const childComments = article.comments.filter(c => c.parentCommentId === comment.id);
        if (childComments.length > 0) {
          return {
            ...comment,
            writer: comment.writer,
            childComments,
          };
        }
        return comment;
      })
      .filter(comment => !comment.parentCommentId);

    // split the content into paragraphs, images, videos, etc.
    const content = article.content.split("||");

    // format the articles in the category
    const moreArticles = article.category?.articles?.map(article => {
      let content = article.content.split("||")
      let firstParagraph = content.find((str) => str.startsWith("pa:"));
      //remove the "pa:" from the string
      if (firstParagraph) {
        firstParagraph = firstParagraph.replace("pa:", "");
      }
      //if there is no paragraph, use the first text
      else
        firstParagraph = content[0];
      return {
        id: article.id,
        cover: `/assets/articleImages/${article.id}/cover.jpeg`,
        title: article.title,
        content: firstParagraph,
      }
    });

    // get user
    const user = await authenticator.isAuthenticated(request);
    const identificator = user ? user.email : await getIp() || 'unknown';

    const articleObject = {
      articleId: params.articleId,
      title: article.title,
      cover: `/assets/articleImages/${params.articleId}/cover.jpeg`,
      content: content,
      comments: commentsWithChildren,
      category: article.category ? {
        title: article.category?.name,
        articles: moreArticles,
      }
        : null,
      likes: article.likes.length,
      likesArray: article.likes
    } as Article;

    return { article: articleObject, user: user, identificator: identificator };
  }
  else return {};
}

export async function action({ request }: ActionFunctionArgs) {
  // check if the body contains the action "add_like"
  let body = await request.text()
  let bodyJSON = JSON.parse(body);

  // get user
  const user = await authenticator.isAuthenticated(request);
  if (bodyJSON.action === "add_like") {
    // The identificator in the db depends on if the user is logged in. 
    //If the user is logged in, the identificator is the user email, if not, the identificator is the user IP

    let identificator = user ? user.email : request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown'

    // add a row to likes table with the article id and the user identificator
    await db.like.create({
      data: {
        articleId: parseInt(bodyJSON.id),
        userEmailOrIP: identificator,
      }
    });


    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Like added" }),
    };
  }

  return {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Invalid request" }),
  };

}

import Comment from "../types/comment";
import ArticlePreview from "../types/articlePreview";
import { authenticator } from "~/services/auth.server";
import ProfileAuthFragment from "~/types/profileAuthFragment";

type likeElement = {
  id: number;
  articleId: number;
  userEmailOrIP: string;
  createdAt: Date;
}

export type Article = {
  articleId: string;
  title: string;
  cover: string;
  content: string[];
  category?: {
    title: string;
    articles: ArticlePreview[]
  };
  comments?: Comment[];
  likes?: number;
  likesArray?: likeElement[];
};

function Article() {
  const {article:data, user, identificator} = useLoaderData<{ article: Article, user: ProfileAuthFragment, identificator: string }>();
  const [likes, setLikes] = React.useState(data.likes || 0);

  // Check if the user has liked the article by seeing if the identificator is in the likes table
  let isLiked = data.likes ? data.likesArray?.some(likeElement => likeElement.userEmailOrIP == identificator ) : false;
  const [liked, setLiked] = React.useState(isLiked);

  const handleLike = async () => {

    if (liked) return;

    // Update the likes count
    setLikes(likes + 1);
    setLiked(true);

    let ip = await getIp();
    try {

      const response = await fetch(`/articles/${data.articleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-real-ip": ip,
        },
        body: JSON.stringify({
          action: "add_like",
          id: data.articleId
        })
      });
    } catch (error) {
      // Handle the error
      console.error(error);
    }
  };


  //refresh the state of likes when the user navigates to another article or refreshes the page
  React.useEffect(() => {
    setLikes(data.likes || 0);
    setLiked(isLiked);
  }, [data.likes]);


  return (
    <div className="">
      <Hero cover={data.cover} title={data.title} />
      <div className="mt-10">
        <span className="ml-20 text-2xl">{likes}</span>
        {liked ?
          <button className="bg-green-500 text-white font-bold py-2 px-4 rounded ml-5" disabled> Liked </button> :
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-5" onClick={handleLike}> Like </button>}
      </div>
      {
        data.content.map(element => {
          if (element.startsWith("pa:")) {
            return (
              <p className="max-w-3xl m-auto mt-5"> {element.replace("pa:", "")} </p>
            )
          }
          else if (element.startsWith("im:")) {
            return (
              <img src={element.replace("im:", "")} alt="" className="max-w-3xl m-auto mt-10" />
            )
          }
          else if (element.startsWith("vi:")) {
            return (
              <video src={element.replace("vi:", "")} controls className="max-w-3xl m-auto mt-10"></video>
            )
          }
          else if (element.startsWith("he:")) {
            return (
              <h2 className="max-w-3xl text-2xl m-auto mt-10"> {element.replace("he:", "")} </h2>
            )
          }
          else {
            return (
              <p className="max-w-3xl m-auto mt-5"> {element} </p>
            )
          }
        })
      }
      {data.category && <Carousel name={data.category.title} articles={data.category.articles} />}
      {/* <h2 className="">Leave a comment</h2>
      <form className="">
        <textarea className=""></textarea>
        <button className="">Submit</button>
      </form> */}

      <h2 className="">Comments</h2>
      <ul className=" max-w-3xl m-auto mt-10">
        {
          // loop trough comments and display them with their children
          data.comments?.map(comment => (
            <li className="mt-10" key={comment.id}>
              <div className=" flex">
                <div>
                  <img src={"../assets/profilePictures/" + comment.writer.profilePicture} alt="" className="w-10 h-10 rounded-full" />
                  <p className=" text-center ">{comment.writer.name}</p>
                </div>
                <p className="ml-10">{comment.content}</p>
              </div>
              <ul className=" border-l-2">
                {
                  comment.childComments?.map(childComment => (
                    <li className="ml-5 mt-10" key={childComment.id}>
                      <div className=" flex">
                        <div>
                          <img src={"../assets/profilePictures/" + childComment.writer.profilePicture} alt="" className="w-10 h-10 rounded-full" />
                          <p className="text-center">{childComment.writer.name}</p>
                        </div>
                        <p className="ml-10">{childComment.content}</p>
                      </div>
                    </li>
                  ))
                }
              </ul>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

/**
 * Retrieves the IP address using the ipify API.
 * Returns 'unknown' if the IP address could not be retrieved.
 * @returns {Promise<string>} A promise that resolves to the IP address as a string.
 */
const getIp = async () => {
  return await fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    return data.ip as string;
  })
  .catch(error => {
    console.error('Error fetching IP address:', error);
    return 'unknown';
  });
}

export default Article;