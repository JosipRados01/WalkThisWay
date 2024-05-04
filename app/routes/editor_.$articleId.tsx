import { LoaderFunctionArgs, json, redirect, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import React from "react";
import { ActionFunctionArgs } from "react-router";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import { GoListOrdered, GoListUnordered } from "react-icons/go";
import { BsTextParagraph, BsCardHeading } from "react-icons/bs";
import { TbHeading } from "react-icons/tb";
import { RiArrowDropUpLine, RiArrowDropDownLine, RiDeleteBin7Line } from "react-icons/ri";
import { FaXmark } from "react-icons/fa6";
import { GoPlus } from "react-icons/go";
import { TfiSave } from "react-icons/tfi";






export async function loader({ request, params }: LoaderFunctionArgs) {

    // make sure the user is logged in
    let user = await authenticator.isAuthenticated(request);
    if (!user) { return redirect("/login") }

    let article;
    if(params.articleId === "new") {
        //create a new article
        article = await db.article.create({
            data: {
                title: "",
                intro: "",
                coverImage: "",
                content: JSON.stringify([]),
                writerId: user.id,
            },
        });
        return  redirect("/editor/" + article.id.toString());
    }
    // get the article data
    let parsedID = parseInt(params.articleId as string);
    if(parsedID){
        article = await db.article.findUnique({
            where: { id: parsedID },
            select: {
                id: true,
                title: true,
                intro: true,
                coverImage: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                writer: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                writerId: true
            }
        });
    }
    else {
        return redirect("/editor/new");
    }
    console.log("article", article)
    if(!article) return redirect("/editor/new");

    return {article, articleId: params.articleId as string};
}


// action function has two options for updating the Bio and Name or the profile picture
// the first option is to update the bio and name

export async function action({ request, params }: ActionFunctionArgs) {
    // get the user data
    let user = await authenticator.isAuthenticated(request);
    if (!user) { return redirect("/login") }

    // check if the request is a multipart form data or not
    if (request.headers.get("Content-Type")?.includes("multipart/form-data")) {
        const uploadHandler = unstable_composeUploadHandlers(
            unstable_createFileUploadHandler({
                maxPartSize: 5_000_000,
                file: ({ filename }) => filename,
                directory: `./public/assets/articleImages/${params.articleId}`,
            })
        );

        const formData = await unstable_parseMultipartFormData(
            request,
            uploadHandler
        );

        let img = formData.get("image") as unknown as { filename: string, filepath: string };
        let pathToImage = img.filepath.toString().split('/').slice(-3).join('/');

        //check the isCover query parameter
        if (request.url.includes("true")) {
            //save the cover picture in the db
            await db.article.update({
                where: {
                    id: parseInt(params.articleId as string),
                },
                data: {
                    coverImage: pathToImage
                },
            });
        } else {
            // append the image to the content
            let content = await db.article.findUnique({
                where: {
                    id: parseInt(params.articleId as string),
                },
                select: {
                    content: true,
                },
            });
            if(content){
                let articleContent = JSON.parse(content.content);
                articleContent.push({ elementType: "image", src: pathToImage });

                // update the article data in the db
                await db.article.update({
                    where: {
                        id: parseInt(params.articleId as string),
                    },
                    data: {
                        content: JSON.stringify(articleContent),
                    },
                });
            }
        }

        return json({ imageSrc: pathToImage });
    } else {
        // if the request is not a multipart form data then it is save request
        // get the data from the request body
        let data = await request.json();

        let title = data.title;
        let intro = data.intro;
        let content = JSON.stringify(data.content);

        // check if the article exists
        let article = await db.article.findUnique({
            where: {
                id: parseInt(params.articleId as string),
            },
        });

        console.log("content", content)

        if (!article) {
            // if the article does not exist then create a new one
            const newArticle = await db.article.create({
                data: {
                    title,
                    intro,
                    content,
                    writerId: user.id,
                },
            });
            const newArticleId = newArticle.id;
            //redirect to the article page
            return redirect(`/article/${newArticleId}`);
        } else {
            // update the article data in the db
            await db.article.update({
                where: {
                    id: parseInt(params.articleId as string),
                },
                data: {
                    title,
                    intro,
                    content,
                },
            });
        }
    }
    return { status: 200, headers: { "Content-Type": "application/json" } };
}


const ElementContainer = ({ children, onDelete, onMoveUp, onMoveDown }: { children: React.ReactNode, onDelete: () => void, onMoveUp: () => void, onMoveDown: () => void }) => {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex justify-end gap-8 w-3/4">
                <button className=" text-white w-8 h-8 mt-4 flex items-center justify-center hover:scale-125" onClick={onDelete}>
                    <FaXmark className="w-4 h-4" />
                </button>
                <button className=" text-white mt-4 hover:scale-125" onClick={onMoveDown} >
                    <RiArrowDropDownLine className="w-8 h-8" />
                </button>
                <button className=" text-white mt-4 hover:scale-125" onClick={onMoveUp} >
                    <RiArrowDropUpLine className="w-8 h-8" />
                </button>
            </div>
            {children}
        </div>
    );
}

// inputs for all the different types of elements that we will have in the article
const HeaderInput = ({placeholder = "", mainHeader = false, value, key, uniqueKey, setValueForInput } : {placeholder: string | undefined, mainHeader: boolean|undefined, value: string, key: number, uniqueKey:number, setValueForInput: saveValueForInputType }) => {
    function autoExpand(e : React.ChangeEvent<HTMLTextAreaElement>) {
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }
    return <textarea placeholder={placeholder} key={uniqueKey} value={value} onChange={(e) => setValueForInput(e.target.value, uniqueKey)} className={`border border-gray-300 rounded-md px-4 py-2 my-4 bg-opacity-50 bg-black text-${mainHeader? "7" : "5"}xl w-full`} style={{overflow: 'hidden', resize: 'none'}} onInput={autoExpand} onFocus={autoExpand} />
}

const ParagraphInput = ({placeholder, key, uniqueKey, value, setValueForInput}: {placeholder: string, key: number, uniqueKey:number, value:string, setValueForInput: saveValueForInputType}) => {
    function autoExpand(e : React.ChangeEvent<HTMLTextAreaElement>) {
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }
    return <textarea placeholder={placeholder} key={uniqueKey} value={value} onChange={(e)=> setValueForInput(e.target.value, uniqueKey)}   className="border border-gray-300 rounded-md px-4 py-2 my-4 bg-opacity-50 bg-black w-3/4" style={{overflow: 'hidden', resize: 'none'}} onInput={autoExpand} onFocus={autoExpand} ></textarea>
}

const ListInput = ({listItems, ordered , key, uniqueKey, setValueForInput, addItem, removeItem} : {listItems: { id: number, value: string }[], ordered: boolean, key: number, uniqueKey: number, setValueForInput: saveValueForInputType, addItem: (uniqueKey: number) => void , removeItem:(uniqueKey: number, id: number ) => void }) => {
    return (
        <ul key={uniqueKey} className=" flex flex-col items-center my-4 w-full">
            {listItems.map((item, index) => (
                <li key={item.id} className="flex items-center mb-4 group w-full">
                    { ordered && <p className="text-xl pr-2" >{index + 1}.</p>}
                    <input
                        type="text"
                        placeholder="Stavka"
                        className="flex-grow border border-gray-300 rounded-md px-4 py-2 bg-transparent"
                        value={item.value}
                        onChange={(e) => {setValueForInput(e.target.value, uniqueKey, item.id)}}
                    />
                    { listItems.length > 1 && <button
                        onClick={() => removeItem(uniqueKey, item.id)}
                        className="text-black px-2 py-2 group-hover:text-white"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>}
                </li>
            ))}
            <button onClick={()=> {addItem(uniqueKey)}} className=" text-white px-4 pb-2 mb-4" >
               <GoPlus className="w-6 h-6" />
            </button>
        </ul>
    );
}

const ImageRender = ({src}: {src: string}) => {
    return (
        <div className="flex justify-center py-2">
            <img src={`../assets/${src}`} alt="image" className="w-full" />
        </div>
    )

}

const ElementAddingComponent = ({ addSelectedElement, elementAdding, toggleElementAdding, elementAddingClasses }: { addSelectedElement: (element: string) => void, elementAdding: boolean, toggleElementAdding: () => void, elementAddingClasses: string   }) => {
    
    return (
        <>
        <div className="flex justify-center mt-8">
                <button onClick={() => {toggleElementAdding() }} className="text-white font-bold py-2 px-4 rounded animate-bounce">
                    {!elementAdding &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 transition-all hover:scale-110">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    }
                    { elementAdding &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 transition-all hover:scale-110">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    }
                </button>
            </div>

            <div className="mt-8 flex flex-row gap-8">

                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("he") }}>
                    <TbHeading className="h-6 w-6 "/>
                </div>

                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("pa") }}>
                    <BsTextParagraph className="h-6 w-6 "/>
                </div>

                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("ol") }}>
                    <GoListOrdered className="h-6 w-6 "/>
                </div>

                <div className={elementAddingClasses}onClick={() => {toggleElementAdding(); addSelectedElement("ul") }}>
                   <GoListUnordered className="h-6 w-6 "/>
                </div>
                
                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("im") }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                </div>
            </div>
        </>
    )
}

const ImageModal = ({setIsImageModalOpen, isCover, articleId, save}: {setIsImageModalOpen: (state: boolean) => void, isCover: boolean, articleId: string, save: () => void} ) => {

    const ImageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const target = event.currentTarget as HTMLFormElement;
        
        const formData = new FormData(target);
        const isCover = formData.get("isCover") as string;

        // We save to not lose any data
        await save();
    
        try {
            const formData = new FormData();
            formData.append("image", target.image.files[0]);

            await fetch(`/editor/${articleId}?${isCover}`, {
                method: "POST",
                body: formData,
            });
            // reload page
            window.location.reload();
        } catch (error) {
            // Handle any network or server errors
            console.error(error);
        }
    };

    return (
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-xl max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Uplaod image
                        </h3>
                        <button type="button" onClick={() => setIsImageModalOpen(false)} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="p-4 md:p-5">
                        <Form className="space-y-4" method="post" encType="multipart/form-data" onSubmit={ImageSubmit}>
                            <div>
                                <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ime</label>
                                <input type="file" name="image" id="image" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                                <input type="hidden" name="isCover" value={JSON.stringify(isCover)} />
                            </div>

                            <button className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="submit">
                                Update
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}

type saveValueForInputType = (value: string, key: number, listId?: number) => void;

export default function Editor() {

    const data = useLoaderData() as { article: any, articleId: string };
    let content = JSON.parse(data.article.content);
    console.log(data)

    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
    const [isCover, setIsCover] = React.useState(false);
    
    function openAddImageModal(isCover:boolean) {
        setIsImageModalOpen(true);
        setIsCover(isCover);
    }

    const [mainTitle, setMainTitle] = React.useState(data.article.title);
    const [intro, setIntro] = React.useState(data.article.intro);

    const [otherElements, setOtherElements] = React.useState<any[]>(content);

    function addSelectedElement(selectedElement: string) {
        let uniqueKey = Date.now();
        switch (selectedElement) {
            case "he":
                setOtherElements(prevElements => [...prevElements, { uniqueKey, elementType: "header", placeholder: "Podnaslov", mainHeader: false, value: '' } ]);
                break;
            case "pa":
                setOtherElements(prevElements => [...prevElements, { uniqueKey, elementType: "paragraph", placeholder:"Unesite tekst", value: ''}]);
                break;
            case "ol":
                setOtherElements(prevElements => [...prevElements, { uniqueKey, elementType: "orderedList", listItems: [{ id: 0, value: '' }] }]);
                break;
            case "ul":
                setOtherElements(prevElements => [...prevElements, { uniqueKey, elementType: "unorderedList", listItems: [{ id: 0, value: '' }] }]);
                break;
            case "im":
                openAddImageModal(false);
                break;
        }
    }

    function removeElement(id: number) {
        setOtherElements(prevElements => prevElements.filter(element => element.uniqueKey !== id));
    }

    function moveElementUp(id: number) {
        const index = otherElements.findIndex(element => element.uniqueKey === id);
        if (index > 0) {
            const updatedElements = [...otherElements];
            const temp = updatedElements[index];
            updatedElements[index] = updatedElements[index - 1];
            updatedElements[index - 1] = temp;
            setOtherElements(updatedElements);
        }
    }

    function moveElementDown(id: number) {
        const index = otherElements.findIndex(element => element.uniqueKey === id);
        if (index < otherElements.length - 1) {
            const updatedElements = [...otherElements];
            const temp = updatedElements[index];
            updatedElements[index] = updatedElements[index + 1];
            updatedElements[index + 1] = temp;
            setOtherElements(updatedElements);
        }
    }

    const setValueForInput: saveValueForInputType = (value, key, listId) => {
        setOtherElements(prevElements => {
            const index = prevElements.findIndex(element => element.uniqueKey === key);
            let updatedElement;
            if(listId !== undefined) {
                updatedElement = { ...prevElements[index] };
                const updatedListItems = [...updatedElement.listItems];
                const listItemIndex = updatedListItems.findIndex(item => item.id === listId);
                updatedListItems[listItemIndex] = { id: listId, value };
                updatedElement.listItems = updatedListItems;
            }
            else {
                updatedElement = { ...prevElements[index], value: value };
            }
            const updatedElements = [...prevElements];
            updatedElements[index] = updatedElement;
            return updatedElements;
        });
    }
    const addListItem = (uniqueKey: number) => {
        setOtherElements(prevElements => {
            const index = prevElements.findIndex(element => element.uniqueKey === uniqueKey);
            const updatedElement = { ...prevElements[index] };
            const updatedListItems = [...updatedElement.listItems];
            updatedListItems.push({ id:updatedListItems[updatedListItems.length -1].id + 1 , value: '' });
            updatedElement.listItems = updatedListItems;
            const updatedElements = [...prevElements];
            updatedElements[index] = updatedElement;
            return updatedElements;
        });
    }

    const removeListItem = (uniqueKey: number, id: number) => {
        setOtherElements(prevElements => {
            const index = prevElements.findIndex(element => element.uniqueKey === uniqueKey);
            const updatedElement = { ...prevElements[index] };
            const updatedListItems = updatedElement.listItems.filter((item: {id:number}) => item.id !== id);
            updatedElement.listItems = updatedListItems;
            const updatedElements = [...prevElements];
            updatedElements[index] = updatedElement;
            return updatedElements;
        });
    }

    let [elementAdding, setElementAdding] = React.useState(false);
    let [elementAddingClasses, setElementAddingClasses] = React.useState("element transition-opacity duration-500 opacity-0 mb-4 hover:scale-110");

    const toggleElementAdding = () => {
        // toggle the classes
        if(elementAdding) {
            setElementAddingClasses("element transition-opacity duration-500 opacity-0 mb-4 hover:scale-125")
        }
        else {
            setElementAddingClasses("element transition-opacity duration-500 opacity-100 mb-4 hover:scale-125")
        }
        // toggle the state
        setElementAdding(!elementAdding);
    }

    const save = () => {
        // generate the form data
        let dataToSend = {
            title: mainTitle,
            intro: intro,
            content: otherElements,
        };
    
        fetch(`/editor/${data.articleId}`, {
            method: "POST",
            body: JSON.stringify(dataToSend),
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="">WTW Article Editor</h1>
            <div className="w-full flex flex-col items-center justify-center relative" >
                <figure className="w-full h-full absolute dark-filter">
                    { data.article.coverImage && <img src={`../assets/${data.article.coverImage}`} alt="cover" className="w-full h-full object-cover" />}
                </figure>
                <div className="flex flex-col items-center w-1/2 py-60 relative">
                    <HeaderInput placeholder="glavni naslov" value={mainTitle} setValueForInput={(val, _)=>{setMainTitle(val)}} mainHeader={true} key={69} uniqueKey={69} />
                    <ParagraphInput placeholder='Uvod/ kratki opis' value={intro} setValueForInput={(val, _)=>{setIntro(val)}} key={96} uniqueKey={96} />
                    <button onClick={() => {openAddImageModal(true)}} className="border border-gray-300 bg-black bg-opacity-75 text-white px-4 py-2 my-4 rounded-md" >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-center w-1/2">
                {otherElements.map((element, index) => {
                    return (
                        <ElementContainer key={index} onDelete={() => removeElement(element.uniqueKey)} onMoveUp={() => moveElementUp(element.uniqueKey)} onMoveDown={() => moveElementDown(element.uniqueKey)} >
                            { element.elementType === "header" && <HeaderInput placeholder={element.placeholder} mainHeader={element.mainHeader} value={element.value} key={element.uniqueKey} uniqueKey={element.uniqueKey} setValueForInput={setValueForInput} /> }
                            { element.elementType === "paragraph" && <ParagraphInput placeholder={element.placeholder} value={element.value}  key={element.uniqueKey} uniqueKey={element.uniqueKey} setValueForInput={setValueForInput} /> }
                            { element.elementType === "orderedList" && <ListInput   listItems={element.listItems} ordered={true}  key={element.uniqueKey} uniqueKey={element.uniqueKey} setValueForInput={setValueForInput} addItem={addListItem} removeItem={removeListItem} /> }
                            { element.elementType === "unorderedList" && <ListInput listItems={element.listItems} ordered={false} key={element.uniqueKey} uniqueKey={element.uniqueKey} setValueForInput={setValueForInput} addItem={addListItem} removeItem={removeListItem} /> }
                            { element.elementType === "image" && <ImageRender src={element.src} /> }
                        </ElementContainer>
                    )
                }) }
            </div>

            <ElementAddingComponent addSelectedElement={addSelectedElement} elementAdding={elementAdding} toggleElementAdding={toggleElementAdding} elementAddingClasses={elementAddingClasses} />

            <div className="p-6" ></div>

            <button onClick={save} className="bg-green-500 text-white px-4 py-2 mb-4 rounded-md flex flex-row" >
                <TfiSave className="w-6 h-6" />
                <span className="mx-2">SAVE</span>  
                <TfiSave className="w-6 h-6" />
            </button>

            <div className="p-16" ></div>

            {isImageModalOpen && <ImageModal setIsImageModalOpen={setIsImageModalOpen} isCover={isCover} articleId={data.articleId} save={save} />}

        </div>
    );
}
