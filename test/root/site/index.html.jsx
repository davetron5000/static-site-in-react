import React from "react";
import Layout from "./components/Layout";
import SiteData from "./derived_site_data.js";

export default function(props) {
  const links_to_files = SiteData.pages.map( (page) => {
    return (
      <li key={page.relative_url} ><a href={ page.relative_url }>{ page.title }</a></li>
    );
  });
  return(
    <Layout>
      <p className="avenir pa5">This is the index page!</p>
        <ul>
          { links_to_files }
        </ul>
    </Layout>
  );
}
