

Currently the project consists of the following pages:
- Landing page
- Collections page
- Article page
- Profile page
- Log in / Register page
- Gigs near you page

And of the following creation/admin pages:
- Write article
- Add gig
- Publish or decline article
- Profile settings
Optional gallery section

The landing page acts like the central point between the different interacting sections. 
The gigs and the articles are the bulk of the content of the magazine.
Articles are separated into categories based on their category. 
Gigs describe what artist is having a performance where and when. This system is not fully fleshed out yet, but it is something i will be doing after I finish the articles part of the page and the profile part.

The minimum project scope will be a regular magazine that has the following pages and functionalities:
- Landing page with articles displayed and divided into categories.
- Categories page - redundant at first, but as the number of categories and articles in each category grows it will have its use.
- Category page - a page containing all articles from a single category.
- Article page - a page displaying the contents of an article

- Profile page - Here you see your profile picture, name and other profile details

- Log in/Register page - yup
- Write article page - an editor where you will be able to generate articles and request their publishing
- Publish or decline article page - Here you will be able to see the unpublished, but completed articles written by users.

After this is finished I will start work on planning out and building the gigs near you part of the magazine.

The trello board where project tasks are is [here](https://trello.com/b/m4sLogg3/walk-this-way)

![Rough pages sketch](./public/assets/rough%20page%20sketches.png)


# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

# Tailwind build command
npx tailwindcss -i ./app/styles/global.css -o ./src/styles/global.css --watch
