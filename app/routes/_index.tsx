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
    <GigsNearYou/>
    <Categories categories={ categories }/>
    <Registration/>
    <Footer/>
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
      <div className="absolute-center inset-0 text-shadow">
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

export type Article = {
  image: string;
  title: string;
  text: string;
};

function ArticleCard({image, title, text}: Article) {
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
    <div className="flex flex-wrap flex-center min-h-screen p-20">
      {articles.map((article) => <ArticleCard {...article} />)}
    </div>
  )
}

import mapImage from "~/images/map.jpeg";

function GigsNearYou() {
  return (
    <div className="relative flex-column flex-center h-screen text-white text-center rocker overflow-hidden">
      <img src={mapImage} alt="" className="parallaxImage h-screen w-full object-cover dark-filter" />
      <div className="absolute-center text-shadow bg-shadow p-10 rounded-2xl">
        <h1 className="text-7xl pb-5">Svirke blizu tebe</h1>
        <p>Koristi našu interaktivnu mapu da pogledas svrirke blizu tebe</p>
      </div>
    </div>
  )
}


function ArticlePreview({image, title, text}: Article) {
  return (
    <div className="flex flex-col p-5 border w-96 m-10 aspect-square">
      <img src={image} alt="" className="aspect-square pb-5" />
      <h2 className="text-xl font-bold mb-3 line-clamp-2">{title}</h2>
      <p className="line-clamp-3">{text}</p>
    </div>
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

function Carousel({title, articles}: {title:string, articles: Article[]}) {
  return (
    <div className="relative">
      <h2 className="ps-20 pt-20 text-4xl">{title}</h2>
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

type Category = {
  title: string; 
  articles: Article[];
}

const categories: Category[] = [
  {
    title: "Metal",
    articles: [
      {
        image: "https://picsum.photos/500",
        title: "Metallica rocks the stage in New York",
        text: "Metallica played an epic concert in New York last night, performing all their greatest hits to a sold-out crowd of over 50,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'Enter Sandman' and a surprise guest appearance by Dave Mustaine during 'The Four Horsemen'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/400",
        title: "Iron Maiden rocks the stage in London",
        text: "Iron Maiden played an epic concert in London last night, performing all their greatest hits to a sold-out crowd of over 50,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'The Trooper' and a surprise guest appearance by Bruce Dickinson during 'Fear of the Dark'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/600",
        title: "Black Sabbath reunites for epic concert in Los Angeles",
        text: "Black Sabbath played a historic concert in Los Angeles last night, marking the first time the band's original lineup has performed together in over 20 years. The show was a celebration of the band's classic album 'Paranoid', with the band playing the entire album from start to finish. The crowd went wild for hits like 'Iron Man' and 'War Pigs', and the band even threw in a few surprises, like a cover of 'N.I.B.'. Fans are already calling it one of the best concerts of all time."
      },
      {
        image: "https://picsum.photos/500",
        title: "Slayer rocks the stage in Chicago",
        text: "Slayer played an epic concert in Chicago last night, performing all their greatest hits to a sold-out crowd of over 20,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'Raining Blood' and a surprise guest appearance by Kerry King during 'Angel of Death'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/400",
        title: "Judas Priest rocks the stage in Tokyo",
        text: "Judas Priest played an epic concert in Tokyo last night, performing all their greatest hits to a sold-out crowd of over 30,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'Breaking the Law' and a surprise guest appearance by Glenn Tipton during 'Painkiller'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/500",
        title: "Foo Fighters rock the stage in Seattle",
        text: "Foo Fighters played an epic concert in Seattle last night, performing all their greatest hits to a sold-out crowd of over 50,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'Everlong' and a surprise guest appearance by Krist Novoselic during 'Big Me'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/400",
        title: "Pearl Jam rocks the stage in Chicago",
        text: "Pearl Jam played an epic concert in Chicago last night, performing all their greatest hits to a sold-out crowd of over 50,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'Alive' and a surprise guest appearance by Chris Cornell during 'Hunger Strike'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/600",
        title: "Red Hot Chili Peppers reunites for epic concert in Los Angeles",
        text: "Red Hot Chili Peppers played a historic concert in Los Angeles last night, marking the first time the band's original lineup has performed together in over 20 years. The show was a celebration of the band's classic album 'Blood Sugar Sex Magik', with the band playing the entire album from start to finish. The crowd went wild for hits like 'Give It Away' and 'Under the Bridge', and the band even threw in a few surprises, like a cover of 'Higher Ground'. Fans are already calling it one of the best concerts of all time."
      },
      {
        image: "https://picsum.photos/500",
        title: "Green Day rocks the stage in New York",
        text: "Green Day played an epic concert in New York last night, performing all their greatest hits to a sold-out crowd of over 20,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'American Idiot' and a surprise guest appearance by Tim Armstrong during 'Basket Case'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/400",
        title: "The Strokes rocks the stage in London",
        text: "The Strokes played an epic concert in London last night, performing all their greatest hits to a sold-out crowd of over 30,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a pyrotechnic display during 'Last Nite' and a surprise guest appearance by Jarvis Cocker during 'Someday'. Fans are already calling it one of the best concerts of the year."
      }
    ]
  },
  {
    title: "Rock",
    articles: [
      {
        image: "https://picsum.photos/500",
        title: "AC/DC electrifies the crowd in London",
        text: "AC/DC brought their signature brand of hard rock to London last night, playing to a packed house at Wembley Stadium. The band's setlist included classics like 'Highway to Hell', 'Back in Black', and 'Thunderstruck', as well as a few deep cuts for the die-hard fans. The highlight of the show was a 20-minute guitar solo by Angus Young during 'Let There Be Rock', which had the entire stadium on their feet. Fans are already clamoring for the band to announce their next tour dates."
      },
      {
        image: "https://picsum.photos/400",
        title: "Guns N' Roses reunites for epic concert in Los Angeles",
        text: "Guns N' Roses played a historic concert in Los Angeles last night, marking the first time the band's original lineup has performed together in over 20 years. The show was a celebration of the band's classic album 'Appetite for Destruction', with the band playing the entire album from start to finish. The crowd went wild for hits like 'Sweet Child O' Mine' and 'Welcome to the Jungle', and the band even threw in a few surprises, like a cover of 'Knockin' on Heaven's Door'. Fans are already calling it one of the best concerts of all time."
      },
      {
        image: "https://picsum.photos/600",
        title: "Queen rocks the stage in Rio de Janeiro",
        text: "Queen played an epic concert in Rio de Janeiro last night, performing all their greatest hits to a sold-out crowd of over 100,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a duet between Freddie Mercury and Adam Lambert during 'Somebody to Love' and a guitar solo by Brian May during 'Bohemian Rhapsody'. Fans are already calling it one of the best concerts of all time."
      },
      {
        image: "https://picsum.photos/500",
        title: "The Rolling Stones rock the stage in Paris",
        text: "The Rolling Stones played an epic concert in Paris last night, performing all their greatest hits to a sold-out crowd of over 80,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a duet between Mick Jagger and Keith Richards during 'Sympathy for the Devil' and a guitar solo by Ronnie Wood during 'Jumpin' Jack Flash'. Fans are already calling it one of the best concerts of the year."
      },
      {
        image: "https://picsum.photos/400",
        title: "Foo Fighters rock the stage in Sydney",
        text: "Foo Fighters played an epic concert in Sydney last night, performing all their greatest hits to a sold-out crowd of over 50,000 fans. The band's energy was electric, and the audience was on their feet the entire time. Highlights of the show included a duet between Dave Grohl and Taylor Hawkins during 'Everlong' and a guitar solo by Chris Shiflett during 'The Pretender'. Fans are already calling it one of the best concerts of the year."
      }
    ]
  },
  {
    title: "Interviews",
    articles: [
      {
        image: "https://picsum.photos/500",
        title: "Interview with James Hetfield",
        text: "In this exclusive interview, Metallica frontman James Hetfield talks about the band's latest album, 'Hardwired... to Self-Destruct', and what it's like to be a rock star in the 21st century. Hetfield also discusses his struggles with addiction and how he's managed to stay sober for over a decade."
      },
      {
        image: "https://picsum.photos/400",
        title: "Interview with Dave Grohl",
        text: "In this exclusive interview, Foo Fighters frontman Dave Grohl talks about the band's latest album, 'Concrete and Gold', and what it's like to be a rock star in the age of social media. Grohl also discusses his experiences playing with Nirvana and how that shaped his approach to music."
      },
      {
        image: "https://picsum.photos/600",
        title: "Interview with Robert Plant",
        text: "In this exclusive interview, Led Zeppelin frontman Robert Plant talks about his latest solo album, 'Carry Fire', and what it's like to be a rock legend in the 21st century. Plant also discusses his experiences with Led Zeppelin and how the band's music continues to inspire new generations of fans."
      },
      {
        image: "https://picsum.photos/500",
        title: "Interview with Ozzy Osbourne",
        text: "In this exclusive interview, Ozzy Osbourne talks about his latest solo album, 'Ordinary Man', and what it's like to be a rock icon in the 21st century. Osbourne also discusses his experiences with Black Sabbath and how the band's music continues to influence new generations of musicians."
      },
      {
        image: "https://picsum.photos/400",
        title: "Interview with Axl Rose",
        text: "In this exclusive interview, Guns N' Roses frontman Axl Rose talks about the band's reunion tour and what it's like to be back on stage with his former bandmates. Rose also discusses his experiences with the band's classic lineup and how they've managed to put their differences aside for the sake of the music."
      }
    ]
  }
]

function Categories({categories}: {categories:Category[]}) {
  return (
    <div>
      {categories.map((category) => <Carousel {...category} />)}
    </div>
  )
}

function SignUpForm() {
  return (
    <form className="w-3/6">
    <div className="relative z-0 w-full mb-6 group">
      <input type="text" name="floating_first_name" id="floating_first_name" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
      <label htmlFor="floating_first_name" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
        Korisničko ime</label>
    </div>
      <div className="relative z-0 w-full mb-6 group">
        <input type="email" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label htmlFor="floating_email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Email adresa</label>
      </div>
      <div className="relative z-0 w-full mb-6 group">
        <input type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label htmlFor="floating_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          lozinka</label>
      </div>
      <div className="relative z-0 w-full mb-6 group">
        <input type="password" name="repeat_password" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label htmlFor="floating_repeat_password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Ponovite lozinku</label>
      </div>
      <div className="flex flex-center">
      <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Registruj se</button>
        </div>
    </form>
  );
}

function Registration() {
  return (
  <div className="flex flex-col md:flex-row flex-space-around p-20">
    <article className=" md:w-2/6 pb-20">
    <h2 className="text-4xl pb-5">Postani član</h2>
    <p>
      Postani član i prati najnovije vijesti iz svijeta rock i metal muzike
      Walk this way je pokrenunt od strane nasih clanova. 
      Ako zelis da postanes novinar i pises clanke za nas, javi nam se na email. 
      Ako zelis da postanes clan i da dobijas obavjestenja o najnovijim clanacima,
      popuni formu ispod.
    </p>
    </article>

    <SignUpForm/>
  </div>
  )
}

function Footer() {
  return (
    <footer className="">
      <div className="flex flex-row flex-space-around pb-20">
        <div className="">
          <h3 className="text-2xl">Walk this way</h3>
          <p>Heavy metal i Rock Magazin</p>
          <h3 className="text-xl pt-10">Kontakt</h3>
          <p>email: walkthiswaystranica@gmail.com </p>
          <p>telefon: 063/294-805 </p>
        </div>
        <div className="">
          <h3 className="text-2xl">Pratite nas</h3>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>Twitter</p>
        </div>
      </div>
      <div className="flex flex-space-around flex-row pb-5">
        <p>© 2021 Walk this way</p>
        <p>Polica privatnosti</p>
        <p>Uslovi korištenja</p>
      </div>
    </footer>
  )
}