import React from "react"
import SiteIcons from "./SiteIcons"
import SocialMediaCardMetadata from "./SocialMediaCardMetadata"
import Copyright from "./Copyright"

import SiteData from "../derived_site_data.js"

export default class Layout extends React.Component {
  render() {
    const copyright   = new Copyright()
    const title       = SiteData.title       || "Set the title in site_data.json"
    const author      = SiteData.author      || "Set the author in site_data.json"
    const description = SiteData.description || "Set the description in site_data.json"
    const twitter     = SiteData.twitter     || "Set your twitter handle in site_data.json"
    const url         = SiteData.url         || "Set the url in site_data.json"
    return(
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <link rel="copyright" href={ "Copyright (c) " + copyright.string + " " + author + ", All Rights Reserved" } />

    <title></title>

    <SocialMediaCardMetadata
      description={ description }
      author={ author }
      twitter_handle={ twitter }
      title={ title }
      url={ url }
    />
    <SiteIcons />
  </head>
  <body className="ma0 pa0">
    <header className="tc">
      <h1>Welcome to your New Site</h1>
      <p>The header and footer can be edited in <code>root/site/components/Layout.jsx</code></p>
    </header>
    <a name="main" className="">&nbsp;</a>
    <p>
      Everything between this line and the one before the footer can be edited in the <code>.html.jsx</code> file corresponding to whatever link you are looking at (e.g. <code>root/site/index.html.jsx</code> if you are looking at the home page).
    </p>
    <hr />
    { this.props.children }
    <hr />
    <p>
      Everything above this line is in the <code>.html.jsx</code> file.  This and the rest of the page are in <code>Layout.jsx</code>.
    </p>
    <footer className="tc bg-black white pb4 pa2">
      <a name="about"></a>
      <p className="lh-copy">
        Copyright &copy; { copyright.string } by { author }, All Rights Reserved.
      </p>
    </footer>
  </body>
</html>
    );
  }
}

