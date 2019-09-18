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
sure this could be done with a tangled web of duct tape-lade Webpack loaders.

Anyway, open two terminals run:

* `yarn dev:build:watch`
* `yarn dev:webpack:watch`

This should give you a relatively fast hot reload cycle.

# How it works

`root/site` is the root of the source files for the website.  Any file that is *does not*  end in `.html.jsx` will
be copied over directly.  Any `.html.jsx` files are assumed to be React components and will be rendered statically
into `.html` files. They are rendered verbatim, *except* that `<!DOCTYPE html>` is put at the top.

All of this is then fed to Webpack which will:

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


