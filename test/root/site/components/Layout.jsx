import React from "react";

export default class Layout extends React.Component {
  render() {
    return(
      <html lang="en">
        <head>
        </head>
        <body>
          <h1>My Site</h1>
          { this.props.children }
        </body>
      </html>
      );
  }
}
