import React from "react";
import Session from "./session";

const withSession = (Component) => class extends React.Component {
  static async getInitialProps (ctx) {
    const session = new Session({ req: ctx.req });

    let initialProps = {};
    if (Component.getInitialProps) {
      initialProps = await Component.getInitialProps({ ...ctx, session });
    }

    let sessionData = {};
    try {
      sessionData = await session.getSession();
    } catch (sessionError) {
      console.error("Session error", sessionError);
      return alert(sessionError);
    }
    const isLoggedIn = sessionData.user && sessionData.user._id;
    console.log("Is logged in", isLoggedIn);

    return {
      ...initialProps,
      session: sessionData,
      isLoggedIn,
    };
  }

  render () {
    return <Component {...this.props} />;
  }
};

export default withSession;
