import { Link } from "@remix-run/react";
import type ArticlePreview from "../types/articlePreview";

function ArticlePreview({cover: image, title, content: text, id}: ArticlePreview) {
    return (
      <Link to={`http://localhost:3000/articles/${id}`}>
        <div className="flex flex-col p-5 border w-96 m-10 aspect-square">
          <img src={image} alt="" className="aspect-square pb-5 object-cover" />
          <h2 className="text-xl font-bold mb-3 line-clamp-2 h-[3.5rem]">{title}</h2>
          <p className="line-clamp-3 h-[4.5rem]">{text}</p>
        </div>
      </Link>
    )
}

const handleScrollForwards = (event: React.MouseEvent<HTMLDivElement>): void => {
    const screenWidth = window.innerWidth;
    event.currentTarget.parentNode ? (event.currentTarget.parentNode as HTMLElement).scrollBy({left: screenWidth, behavior: "smooth"}) : null;
}

const handleScrollBackwards = (event: React.MouseEvent<HTMLDivElement>): void => {
    const screenWidth = window.innerWidth;
    event.currentTarget.parentNode ? (event.currentTarget.parentNode as HTMLElement).scrollBy({left: -screenWidth, behavior: "smooth"}) : null;
}
  
export function Carousel({name, articles}: {name:string, articles: ArticlePreview[]}) {
    return (
      <div className="relative">
        <h2 className="ps-20 pt-20 text-4xl">{name}</h2>
        <div className="overflow-x-scroll">
          <div className="scrollBack flex flex-center" onClick={ handleScrollBackwards}><i className="fa fa-chevron-left"></i></div>
            <div className="carousel">
              {articles.map((article) => <ArticlePreview {...article} />)}
            </div>
          <div className="scrollForward flex flex-center " onClick={handleScrollForwards}> <i className="fa fa-chevron-right" aria-hidden="true"></i> </div>
        </div>
      </div>
    )
}