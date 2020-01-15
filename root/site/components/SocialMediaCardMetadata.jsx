import React from "react";
import PropTypes from "prop-types";

class SocialMediaCardMetadata extends React.Component {
  render() {
    return(
      <React.Fragment>
        <meta name="description" content={ this.props.description } />
        <meta name="author" content={ this.props.author } />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content={ this.props.twitter_handle } />
        <meta name="twitter:creator" content={ this.props.twitter_handle } />
        <meta name="twitter:title" content={ this.props.title } />
        <meta name="og:title" content={ this.props.title } />
        <meta name="og:url" content={ this.props.url } />
        <meta property="og:type" content="website" />
        <meta name="twitter:description" content={ this.props.description } />
      </React.Fragment>
    );
  }
}

SocialMediaCardMetadata.propTypes = {
  /* description of the website */
  description: PropTypes.string.isRequired,
  /* Name or names of the author(s) */
  author: PropTypes.string.isRequired,
  /* twitter handle, with the @, of the author or relevant account */
  twitter_handle: PropTypes.string.isRequired,
  /* Title of the website */
  title: PropTypes.string.isRequired,
  /* Canonical URL to the website */
  url: PropTypes.string.isRequired
};

export default SocialMediaCardMetadata;
