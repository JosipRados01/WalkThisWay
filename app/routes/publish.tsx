import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";


export async function loader({ request }: LoaderFunctionArgs) {
    //check if the user is authenticated and has the required permissions
    let user = await authenticator.isAuthenticated(request);

    if(user?.role !== 'admin' && user?.role !== 'publisher') {
        return redirect('/login');
    }

    // get all articles from the database where the status is draft
    let articles = await db.article.findMany({
        where: {
            status: 'DRAFT'
        },
        select: {
            id: true,
            title: true,
            intro: true,
            coverImage: true,
            writer: {
                select: {
                    profilePicture: true,
                    name: true
                }
            }
        }
    });

    if(!articles) articles = [];

    articles.forEach((article) => {
        article.writer.profilePicture = `../${article.writer.profilePicture}`;
    });

    return { articles };
}

type ArticleAndWriterPreview = {
    id: string;
    title: string;
    intro: string;
    coverImage: string;
    writer: {
        profilePicture: string;
        name: string;
    }
}

export default function Publish() {

    let {articles} = useLoaderData() as {articles : ArticleAndWriterPreview[]};

    if(articles.length === 0){
        return (
            <div className="flex flex-col justify-center items-center">
                <h1>No articles to publish</h1>
                <p>All done 🎉</p>
            </div>
        )

    }

    let navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold mb-10">Publish</h1>
            <ul className="w-1/2">
                {articles.map((article) => (
                    <li key={article.id} className="flex flex-row w-full mb-5 p-4 hover:bg-gray-800 rounded-md" onClick={()=>{ navigate('/articles/' + article.id)} }>
                        <div>
                            <img src={article.writer.profilePicture} alt={article.title} className="w-24 h-24 rounded-full object-cover" />
                            <p className="text-center text-xl" >{article.writer.name}</p>
                        </div>
                        <div className="ml-10 w-full">
                            <h2 className=" text-3xl">{article.title}</h2>
                            <p className="text-lg">{article.intro}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}