import { LoaderFunctionArgs, json, redirect, unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import React from "react";
import { ActionFunctionArgs } from "react-router";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";



export async function loader({ params }: LoaderFunctionArgs) {
    let article = await db.article.findUnique({
        where: { id: parseInt(params.articleId as string) },
        select: {
            id: true,
            title: true,
            intro: true,
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
        console.log(img)
        let pathToImage = img.filepath.toString().split('/').slice(-3).join('/');
        console.log(pathToImage)

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

        console.log(data)

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
    return { status: 200, headers: { "Content-Type": "application/json" } };
}


const ElementContainer = ({ children, onDelete, onMoveUp, onMoveDown }: { children: React.ReactNode, onDelete: () => void, onMoveUp: () => void, onMoveDown: () => void }) => {
    return (
        <div className="w-full flex flex-col items-center">
            {children}
            <div className="flex justify-center gap-8 w-3/4">
                <button className="bg-red-500 text-white px-4 py-2 mb-4 rounded-md" onClick={onDelete}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 mb-4 rounded-md" onClick={onMoveDown} >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
                    </svg>
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 mb-4 rounded-md" onClick={onMoveUp} >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />    
                    </svg>
                </button>
            </div>
        </div>
    );
}

// inputs for all the different types of elements that we will have in the article
const HeaderInput = ({placeholder = "", mainHeader = false, value, key, uniqueKey, setValueForInput } : {placeholder: string | undefined, mainHeader: boolean|undefined, value: string, key: number, uniqueKey:number, setValueForInput: saveValueForInputType }) => {
    return <input type="text" placeholder={placeholder} key={uniqueKey}  value={value} onChange={(e) => setValueForInput(e.target.value, uniqueKey)} className={`border border-gray-300 rounded-md px-4 py-2 my-4 bg-transparent text-${mainHeader? "7" : "5"}xl w-full`}/>
}

const ParagraphInput = ({placeholder, key, uniqueKey, value, setValueForInput}: {placeholder: string, key: number, uniqueKey:number, value:string, setValueForInput: saveValueForInputType}) => {
    return <textarea placeholder={placeholder} key={uniqueKey} value={value} onChange={(e)=> {setValueForInput(e.target.value, uniqueKey)} } className="border border-gray-300 rounded-md px-4 py-2 my-4 bg-transparent w-3/4 " rows={3}></textarea>
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
            <button
                onClick={()=> {addItem(uniqueKey)}}
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
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
                <button onClick={() => {toggleElementAdding() }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {!elementAdding &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    }
                    { elementAdding &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    }
                </button>
            </div>

            <div className="mt-8 flex flex-row gap-8">

                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("he") }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                </div>

                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("pa") }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                </div>

                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("ol") }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                    </svg>
                </div>

                <div className={elementAddingClasses}onClick={() => {toggleElementAdding(); addSelectedElement("ul") }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                </div>
                
                <div className={elementAddingClasses} onClick={() => {toggleElementAdding(); addSelectedElement("im") }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                </div>
            </div>
        </>
    )
}

const ImageModal = ({setIsImageModalOpen, isCover, articleId, save}: {setIsImageModalOpen: (state: boolean) => void, isCover: boolean, articleId: string, save: () => void} ) => {

    const ImageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        console.log("Image submit")
        event.preventDefault();
        const target = event.currentTarget as HTMLFormElement;
        
        const formData = new FormData(target);
        const isCover = formData.get("isCover") as string;
        console.log(isCover);

        // We save to not lose any data
        await save();
    
        try {
            const formData = new FormData();
            formData.append("image", target.image.files[0]);

            await fetch(`/editor/${articleId}?${isCover}`, {
                method: "POST",
                body: formData,
            });
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
        console.log("Index: ", index)
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
            console.log("previosElements")
            console.log(prevElements)
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
            console.log("Updated element: ", updatedElement)
            const updatedElements = [...prevElements];
            updatedElements[index] = updatedElement;
            console.log("Updated elements: ", updatedElements)
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
            setElementAddingClasses("element transition-opacity duration-500 opacity-0 mb-4 hover:scale-110")
        }
        else {
            setElementAddingClasses("element transition-opacity duration-500 opacity-100 mb-4 hover:scale-110")
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
            <h1 className="pb-20">WTW Article Editor</h1>
            <div className="flex flex-col items-center w-1/2 pb-60">
                <HeaderInput placeholder="glavni naslov" value={mainTitle} setValueForInput={(val, _)=>{setMainTitle(val)}} mainHeader={true} key={69} uniqueKey={69} />
                <ParagraphInput placeholder='Uvod/ kratki opis' value={intro} setValueForInput={(val, _)=>{setIntro(val)}} key={96} uniqueKey={96} />
                <button onClick={() => {openAddImageModal(true)}} className="bg-blue-500 text-white px-4 py-2 my-4 rounded-md" >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                </button>
                
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

            <div className="p-20" ></div>

            <button onClick={save} className="bg-blue-500 text-white px-4 py-2 mb-4 rounded-md" >
                Save
            </button>

            <div className="p-40" ></div>

            {isImageModalOpen && <ImageModal setIsImageModalOpen={setIsImageModalOpen} isCover={isCover} articleId={data.articleId} save={save} />}

        </div>
    );
}
