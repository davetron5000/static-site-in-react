# react-static-site

Goal - use React as a templating framework to produce a static set of HTML pages with no required JS dependencies.

# Install/Setup

1. Clone this repo
1. `yarn install`
1. `yarn test` (make sure everything's working)
1. Create files in `root/site` (see below)
1. `yarn build`

## Day to day

This compiles `root/site` into a directory for Webpack, which then builds the site that gets deployed.  Yes, I'm
sure this could be done with a tangled web of duct tape-laden Webpack loaders.

Anyway, open two terminals run:

* `yarn dev:build:watch`
* `yarn dev:webpack:watch`

This should give you a relatively fast hot reload cycle.

# How it works

`root/site` is the root of the source files for the website. All files are copied verbatim to Webpack's input,
  except for these types:

* File ends in `.html.jsx` - it is assumed to be a React component and will be rendered into a `.html` file of the
same name.  `<!DOCTYPE html>` will be placed at the top of the file.
* File ends in `.html.md` - it is assumed to be in Markdown and processed into an `.html` file of the same name.
This file can have so-called “front-matter” to control how the HTML is produced.  See below.

The output all this copying and transforming is  to ask Webpack to compile the site for deployment.  The
configuration will have Webpack:

* compile JS and CSS
* insert refs to your JS bundle and CSS stylesheet into all HTML files

There is very little configuration, but what configuration exists is in `site-config.dev.json`, which is used by
default when you execute the commands above.  If you set `BUILD_ENV` to something, then `site-config.«whatever
BUILD_ENV was».json` is used instead.  The most common use of this is for production builds.

If you examine `site-config.production.json`, you can see that we've configured minification and hashing, and in
that case, Webpack will, Dog willing, minify HTML, CSS, and JS, as well as create hashed filenames for the CSS and
JS to accomodate long-term caching on a CDN.

Note that anytime you build, the results will be in `root/deploy_to_«env»`, where `«env»` is `dev` by default, or
whatever value was in `BUILD_ENV`.

## But I want to insert JavaScript between basic functions already provided by the browser!

You can!  Inside `root/site/js` is `index.js`, which is your Webpack entry point.  You can do whatever you want in
here, including replace the browser with your own JavaScript!

In reality, if you do want some sort of PWA/SPA/WhateverPA, you should use Next.Js or Gatsby. *This* is for making
a site where the basics of navigating and page rendering and handled by a browser connecting to a CDN whenever an
`<a href` is clicked.

But, you can still add JavaScript here as you normally would in Webpack and it'll get compiled.  That's how the
CSS stuff is already working.

And, since this "library" is just inlined code, you can change whatever you want.  Have fun!
