import Document, { Head, Main, NextScript } from "next/document";
import flush from "styled-jsx/server";

// The document (which is SSR-only) needs to be customized to expose the locale
// data for the user"s locale for React Intl to work in the browser.
export default class IntlDocument extends Document {
  static async getInitialProps (context) {
    const props = await super.getInitialProps(context);
    const { req: { localeDataScript }, renderPage } = context;
    const { html, head } = renderPage();
    const styles = flush();

    return {
      ...props,
      html,
      head,
      styles,
      localeDataScript,
    };
  }

  render () {
    return (
      <html lang="en">
        <Head>
          <title>Expexted.email</title>

          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <link rel="stylesheet" href="/static/css/normalize.css" />
          <link rel="stylesheet" href="/static/css/skeleton.css" />
          <link rel="stylesheet" href="/static/css/datetime.css" />
          <link rel="stylesheet" href="/static/css/custom.css" />

          <style>{`
            body, html {
              margin: 0;
              padding: 0;
              min-height: 100%;
              height: 100%;
              position: relative;
            }
          `}</style>
        </Head>
        <body>
          <Main />
          <script
            dangerouslySetInnerHTML={{
              __html: this.props.localeDataScript,
            }}
          />
          <NextScript />
        </body>
      </html>
    );
  }
}
