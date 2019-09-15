# react-static-site

Goal - use React as a templating framework to produce a static set of HTML pages with no JS dependencies.

This is a pipeline like so:

1. INPUT - assets and jsx files
1. RESULT - assets and HTML files to feed to webpack
1. OUTPUT - assets and HTML files, with CSS et. al. ready for deploy


# How it works

`site` is the root of the source files for the website.  Any file called `.html.jsx` will result in a static HTML
page being rendered.  All other files are untouched and copied over, *except* the directory called `components`.
This will be ignored and is intended to be where you can store re-usable React components to create your pages.

The first pass is to copy all files to `site_with_rendered_html`.  Any `.html.jsx` will be rendered as HTML during
this process.

The second pass is to apply Webpack to `site_with_rendered_html`.  By default, Webpack will create a CSS and JS
bundle in the normal way.  The output of this will go into `deploy_to_«env»` where «env» could be "dev",
"production", "test", etc.

# Test Suite

The integration test should be a site that:

* Has a directory tree of HTML/pages as react components
* Uses react components to make those pages work
* Has two .css files
* Uses a third-party CSS library
* Has images and other assets
* Has client-side JS

The test will run the toolchain and produce the site.
