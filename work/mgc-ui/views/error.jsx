import React from 'react';
import { Page } from 'epm-ui';

const page = {
  title: "Error page"
};

const ErrorBody = ( props ) => {
  const { status, stack, message, info } = props;

  if( info ) {
    return (
      <div>
        <h1>{ info.heading }</h1>
        <p>{ info.summary }</p>
        <ul>
          {
            info.suggestions.map( ( suggestion, index ) => <li key={ index }>{ suggestion }</li> )
          }
        </ul>
      </div>
    );
  } else {
    return (
      <div>
        <h1>HTTP Status { status }</h1>
        <h2>{ message }</h2>
        <pre>{ stack }</pre>
      </div>
    );
  }
};

const ErrorPage = ( props ) => (
  <Page>
      <ErrorBody { ...props } />
  </Page>
);

ErrorPage.epmUIPage = page;

export default ErrorPage;
export { ErrorPage };