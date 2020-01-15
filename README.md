# react-static-site

Goal - use React as a templating framework to produce a static set of HTML pages with no required JS dependencies.

# Install/Setup

1. Clone this repo
1. `yarn install`
1. `yarn test` (make sure everything's working)
1. `yarn dev`

This will open up the boilerplate site in your browser.  It should indicate where things are and what you need to
change.

In particular, you should open up `site_data.json` and fill in what's there.  You can add more to this if you
like, and it will be available to your pages when they build.  See below for more data that gets derived for
your.

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

## Markdown Files

If your markdown file is just markdown, it'll be converted into an HTML file pretty much raw.  This may not be
what you want.  Probably, you have some sort of layout components into which you'd like to insert the rendered
HTML.

To do that, prepred your markdown witih _front-matter_, which is a blob of JSON that starts and ends with `---`
like so:

```
---
{
  "component": "Layout",
  "title": "My Page",
  "key": "some value"
}
---
# ${page.title}
## This is my page, oh yeah!

And this is some content: ${page.key}
```

The JSON between the `---` lines will be parsed.  If there is a `component` key, then your HTML will be inserted
into a React component by that name like so:

```
render() {
  html = «rendered HTML»
  return (
    <Layout>
      <div dangerouslySetInnerHTML={ { __html: html } } />
    </Layout>
  )
}
```

Since that HTML could have JavaScript interpolation in it, there is also a variable called `page` that has the
entire contents of the front-matter as its value.  Thus, when we wrote `# ${page.title}`, what results is `<h1>
${page.title}</h1>`, which then renders as `<h1>My Page</h1>`.

## Site-wide Data

It's often handy to have metadata about yuor site's pages, e.g. to auto-generate blog index pages and such.

Thus, there is a `.js` file created called `derived_site_data.js` in the root of your site that you can `import`:

```javascript
const SiteData = import "./derived_site_data.js"
```

This will be a JSON object with various keys set for you by the system:

* `pages` - an array of objects, one for each HTML page. These will have:
  - `relative_url` - relative url to the final page, suitable fo rlinking
  - `title` - if `title` was in the front-matter, it will be here, other wise it will be the humanized path to the
  file, a file with the url `/this/file/here.html` will have a title of “This File Here”.
  - All other front-matter if the file was a markdown file
  - `exceprt` - if the file was a markdown file, this is the first paragraph (`<p>` tag) of the content.

It will also have merged into it, any information in `site_data.json` at the root of your site.

## Configuration

There is very little configuration, but what configuration exists is in `site-config.dev.json`, which is used by
default when you execute the commands above.  If you set `BUILD_ENV` to something, then `site-config.«whatever
BUILD_ENV was».json` is used instead.  The most common use of this is for production builds.

If you examine `site-config.production.json`, you can see that we've configured minification and hashing, and in
that case, Webpack will, Dog willing, minify HTML, CSS, and JS, as well as create hashed filenames for the CSS and
JS to accomodate long-term caching on a CDN.

Note that anytime you build, the results will be in `root/deploy_to_«env»`, where `«env»` is `dev` by default, or
whatever value was in `BUILD_ENV`.

## Helpful links

* https://realfavicongenerator.net - create all the favoicon nonsense
* https://diybookcovers.com/3Dmockups/# - make fancy book icons

## But I want to insert JavaScript between basic functions already provided by the browser!

You can!  Inside `root/site/js` is `index.js`, which is your Webpack entry point.  You can do whatever you want in
here, including replace the browser with your own JavaScript!

In reality, if you do want some sort of PWA/SPA/WhateverPA, you should use Next.Js or Gatsby. *This* is for making
a site where the basics of navigating and page rendering and handled by a browser connecting to a CDN whenever an
`<a href` is clicked.

But, you can still add JavaScript here as you normally would in Webpack and it'll get compiled.  That's how the
CSS stuff is already working.

And, since this "library" is just inlined code, you can change whatever you want.  Have fun!

## But I want to make markdown files that don't have the same URL is the HTML file in prod just like Jekyll

Sorry, you can't.  Just create files in whatever structure you wanted, named whatever you want, and that will be
the URL.  No transalating `2016-03-04` to `2016/03/04`.
