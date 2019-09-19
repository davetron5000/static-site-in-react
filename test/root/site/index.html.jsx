import React from "react";
import Layout from "./components/Layout";
import SiteData from "./derived_site_data.js";

export default function(props) {
  const links_to_files = SiteData.pages.filter( (page) => {
    return !page.blog_post
  }).map( (page) => {
    return (
      <li key={page.relative_url} ><a href={ page.relative_url }>{ page.title }</a></li>
    );
  });
  return(
    <Layout>
      <h1>site_name ${SiteData.site_name}</h1>
      <h2>author ${SiteData.author}</h2>
      <p className="avenir pa5">This is the index page!</p>
        <ul>
          { links_to_files }
        </ul>
    </Layout>
  );
}
