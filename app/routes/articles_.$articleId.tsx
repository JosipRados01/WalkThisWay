import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { Carousel } from "~/components/Carousel";
import { Hero } from "~/components/Hero";
import { db } from "~/utils/db.server";

import type CommentType from "../types/comment";
import ArticlePreview from "../types/articlePreview";
import { authenticator } from "~/services/auth.server";
import Profile from "~/types/profile";

type likeElement = {
  id: number;
  articleId: number;
  userEmailOrIP: string;
  createdAt: Date;
}

type Article = {
  articleId: string;
  title: string;
  cover: string;
  content: string[];
  category?: {
    title: string;
    articles: ArticlePreview[]
  };
  comments?: CommentType[];
  likes?: number;
  likesArray?: likeElement[];
};


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

  if(!article) return {};

  //reformat the comments to have children
  const commentsWithChildren = reformatComments(article.comments);

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

  const user = await getUser(request)
  

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

const getUser  = async (request : Request) => {
  const userAuthFragment = await authenticator.isAuthenticated(request);
   return userAuthFragment ? await db.profile.findUnique({
    where: {
      email: userAuthFragment.email,
    },
  }) : null;
}

//function takes an array of comments and puts any child comments into the parent comment
const reformatComments = (comments: CommentType[]) => {
  return comments.map(comment => {
      const childComments = comments.filter(c => c.parentCommentId === comment.id);
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
  } else if (bodyJSON.action === "add_comment") {
    // get the content and parentCommentId from the body
    let content = bodyJSON.content;
    console.log(content);
    let parentCommentId = bodyJSON.parentCommentId || null;
    let user = bodyJSON.user;
    // get the artice id from the request url
    let articleId = request.url.split("/").pop();
    if(articleId){
        // add a row to the comments table with the content, parentCommentId and the user id
      await db.comment.create({
        data: {
          content: content.replace(/\n/g, "\\n"),
          parentCommentId: parentCommentId,
          writerId: user.id,
          articleId: parseInt(articleId),
        }
      });

      return {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Comment added" }),
      };
    }
  }

  return {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Invalid request" }),
  };

}

function ArticleContent({ content }: { content: string[] }) {
  return content.map(element => {
    if (element.startsWith("pa:")) { return <p className="max-w-3xl m-auto mt-5"> {element.replace("pa:", "")} </p> }

    else if (element.startsWith("im:")) { return <img src={element.replace("im:", "")} alt="" className="max-w-3xl m-auto mt-10" /> }

    else if (element.startsWith("vi:")) { return <video src={element.replace("vi:", "")} controls className="max-w-3xl m-auto mt-10"></video> }

    else if (element.startsWith("he:")) { return <h2 className="max-w-3xl text-2xl m-auto mt-10"> {element.replace("he:", "")} </h2> }

    else { return <p className="max-w-3xl m-auto mt-5"> {element} </p> }
  })
}

function ChildComment({ childComment } : {childComment: CommentType}) {
  return (
    <li className="ml-5 mt-10" key={childComment.id}>
    <div className="flex">
      <div>
        <img src={"../" + childComment.writer.profilePicture} alt="" className="w-24 h-24 rounded-full object-cover" />
        <p className="text-center">{childComment.writer.name}</p>
      </div>
      <p className="ml-10 font-mono">{childComment.content}</p>
    </div>
  </li>
  )
}

function Comment ({comment, user, articleId, addCommentToState}: {comment: CommentType, user: Profile, articleId: string, addCommentToState: (comment: CommentType) => void}) {
  return (
  <li className="mt-10" key={comment.id}>
    <div className="flex">
      <div>
        <img src={"../" + comment.writer.profilePicture} alt="" className="w-24 h-24 rounded-full object-cover" />
        <p className="text-center ">{comment.writer.name}</p>
      </div>
      <p className="ml-10">{comment.content}</p>
    </div>
    <ul className=" border-l-2">
      {
        comment.childComments?.map(childComment => (
          <ChildComment childComment={childComment} />
        ))
      }
      <p className="ml-5 mt-10 font-bold">Reply</p>
      {user && <CommentForm parentCommentId={comment.id} user={user} articleId={articleId} addCommentToState={addCommentToState} />}
    </ul>
  </li>
  )
}

function Comments({ comments, user, articleId, addCommentToState }: { comments: CommentType[], user: Profile, articleId: string, addCommentToState: (comment: CommentType) => void}) {
  return (<ul className=" max-w-3xl m-auto mt-10">
        {
          comments?.map(comment => (
            <Comment comment={comment} user={user} articleId={articleId} addCommentToState={addCommentToState} />
          ))
        }
      </ul>)
}

function CommentForm({ parentCommentId, user, articleId, addCommentToState } : { parentCommentId: number | undefined, user: Profile, articleId: string, addCommentToState: (comment: CommentType) => void}) {
  const handleComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const content = formData.get("content") as string;
    console.log(content);
    if(!content.trim()) return;

    // empty the textarea
    (event.currentTarget.elements.namedItem("content") as HTMLInputElement).value = "";
    try {
      const response = await fetch(`/articles/${articleId}`, {
        method: "POST",
        body: JSON.stringify({action: "add_comment", content, parentCommentId, user }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        addCommentToState({ id:Math.floor(Math.random() * 1000), content, parentCommentId, writer: user, articleId: parseInt(articleId) } as CommentType);
      } else {
        // Comment submission failed
        // Handle the error, such as displaying an error message
      }
    } catch (error) {
      // Handle any network or server errors
    }
  };

  return (
    <Form method="post" className="flex flex-grow w-2xl m-auto min-h-32" onSubmit={handleComment}>
      <div>
        <img src={"../" + user.profilePicture} alt="" className="w-24 h-24 rounded-full object-cover" />
        <p className="text-center ">{user.name}</p>
      </div>
      <div className="ml-10">
        <textarea name="content" className="w-96 border border-gray-300 rounded-md px-4 py-2 mb-4 bg-transparent block" rows={3} />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-1 px-2 rounded" type="submit"> Comment </button>
      </div>
    </Form>
  )
} 

function Article() {
  const {article:data, user, identificator} = useLoaderData<{ article: Article, user: Profile, identificator: string }>();
  const [likes, setLikes] = React.useState(data.likes || 0);

  // Check if the user has liked the article by seeing if the identificator is in the likes array
  let isLiked = data.likes ? data.likesArray?.some(likeElement => likeElement.userEmailOrIP == identificator ) : false;
  const [liked, setLiked] = React.useState(isLiked);

  // store the comments in state so that the page can be updated when a new comment is added

  const [comments, setComments] = React.useState(data.comments as CommentType[] || []);
  let addCommentToState = (comment: CommentType) => {
    //check if the passed comment has a parent commentId. If so, add it to the parent comment's childComments array
    if(comment.parentCommentId){
      setComments(comments.map(c => {
        if(c.id === comment.parentCommentId){
          return {
            ...c,
            childComments: [...c.childComments || [], comment]
          }
        }
        return c;
      }))
    }
    else
    setComments([...comments, comment]);
  }

  const handleLike = async () => {

    if (liked) return;

    // Update the likes count immediately for better UX
    setLikes(likes + 1);
    setLiked(true);

    let ip = await getIp();
    try {
      fetch(`/articles/${data.articleId}`, {
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
    } catch (error) { console.error(error) }
  };


  //refresh the state of likes when the user navigates to another article or refreshes the page
  React.useEffect(() => {
    setLikes(data.likes || 0);
    setLiked(isLiked);
    setComments(data.comments as CommentType[] || []);
  }, [data.likes, data.comments]);


  return (
    <div className="">
      <Hero cover={data.cover} title={data.title} />
      <div className="mt-10">
        <span className="ml-20 text-2xl">{likes}</span>
        {liked ?
          <button className="bg-green-500 text-white font-bold py-2 px-4 rounded ml-5" disabled> Liked </button> :
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-5" onClick={handleLike}> Like </button>}
      </div>
      <ArticleContent content={data.content} />
      {data.category && <Carousel name={data.category.title} articles={data.category.articles} />}

      <div className="flex flex-col max-w-3xl m-auto mt-10">
      <h2 className="text-center" >Comments</h2>
      {user && <CommentForm parentCommentId={undefined} user={user as Profile} articleId={data.articleId} addCommentToState={addCommentToState} />}
      </div>
      {data.comments && <Comments comments={comments as CommentType[]} user={user as Profile} articleId={data.articleId} addCommentToState={addCommentToState} />}
      <div className="mt-20 mb-20 pt-20 pb-20" ></div>
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