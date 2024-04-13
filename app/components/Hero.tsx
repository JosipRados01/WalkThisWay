
export function Hero({cover, title, content}: {cover?: string, title?: string, content?: string}) {
    return (
      <div className="relative flex-column flex-center h-screen text-white text-center rocker overflow-hidden">
        <img src={ cover } alt="" className="parallaxImage h-screen w-full object-cover dark-filter" />
        <div className="absolute-center inset-0 text-shadow">
          <h1 className="mt-20 text-7xl pb-5">{ title }</h1>
          {content && <p> {content} </p>}
        </div>
        <p className="absolute inset-x-0 bottom-20 pb-20 text-shadow text-2xl animate-bounce-slow">Čitaj dalje</p>
       </div>
    )
  }
  