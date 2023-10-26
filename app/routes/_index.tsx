import type { MetaFunction } from "@remix-run/node";
import { ParallaxBanner } from "react-scroll-parallax";
import headerImage from "~/images/naslovna.jpg";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
    <Hero/>
    <ChosenArticles/>
    </>
  );
}

/** @todo: create the elements for the home page: 
 * 1. hero section with paralax image and a cool header and quote
 * 2. chosen articles section with 3 articles
 * 3. svirke blizu tebe block
 * 4. categories block wih netflix style carousel
 * 5. become a member block with small about us text and registration form
 * 6. footer with links to social media and contact form
*/

function Hero() {
  return (
    <div className="relative flex-column flex-center h-screen text-white text-center rocker overflow-hidden">
      <img src={headerImage} alt="" className="parallaxImage h-screen w-full object-cover dark-filter" />
      <div className="absolute inset-0 text-shadow">
        <h1 className="mt-20 text-7xl pb-5">Walk This Way</h1>
        <p>Heavy metal i Rock Magazin</p>
      </div>
      <p className="absolute inset-x-0 bottom-20 pb-20 text-shadow text-2xl animate-bounce-slow">Čitaj dalje</p>
     </div>
  )
}


const articles = [
  {
    image: "https://picsum.photos/500",
    title: "Metallica rocks the stage in New York",
    text: "Metallica played an epic concert in New York last night, performing all their greatest hits to a sold-out crowd of over 50,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'Enter Sandman' and a surprise guest appearance by Dave Mustaine during 'The Four Horsemen'. Fans are already calling it one of the best concerts of the year."
  },
  {
    image: "https://picsum.photos/400",
    title: "AC/DC electrifies the crowd in London",
    text: "AC/DC brought their signature brand of hard rock to London last night, playing to a packed house at Wembley Stadium. The band's setlist included classics like 'Highway to Hell', 'Back in Black', and 'Thunderstruck', as well as a few deep cuts for the die-hard fans. The highlight of the show was a 20-minute guitar solo by Angus Young during 'Let There Be Rock', which had the entire stadium on their feet. Fans are already clamoring for the band to announce their next tour dates."
  },
  {
    image: "https://picsum.photos/600",
    title: "Guns N' Roses reunites for epic concert in Los Angeles",
    text: "Guns N' Roses played a historic concert in Los Angeles last night, marking the first time the band's original lineup has performed together in over 20 years. The show was a celebration of the band's classic album 'Appetite for Destruction', with the band playing the entire album from start to finish. The crowd went wild for hits like 'Sweet Child O' Mine' and 'Welcome to the Jungle', and the band even threw in a few surprises, like a cover of 'Knockin' on Heaven's Door'. Fans are already calling it one of the best concerts of all time."
  }
]

function ArticleCard({image, title, text}: {image: string, title: string, text: string}) {
  return (
    <div className="flex flex-col p-5 border w-3/4 lg:w-1/3 xl:w-1/4 m-10 aspect-square">
      <img src={image} alt="" className="aspect-square pb-5" />
      <h2 className="text-xl font-bold mb-3 line-clamp-2">{title}</h2>
      <p className="line-clamp-3">{text}</p>
    </div>
  )
}
  

function ChosenArticles() {
  return (
    <div className="flex flex-wrap flex-center h-screen p-20">
      {articles.map((article) => <ArticleCard {...article} />)}
    </div>
  )
}
