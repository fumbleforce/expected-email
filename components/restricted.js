import React from "react";
import Link from "next/link";
import withSession from "./with-session";

const Unauthorized = () => (
  <div>
    <h1>Unauthorized</h1>
    <p>You are not authorized to view this page.</p>
    <p><Link prefetch href="/auth/signin"><a>Please log in</a></Link></p>
    <p><Link prefetch href="/"><a>Back to homepage</a></Link></p>
  </div>
);

const restricted = (Component) => class extends React.Component {
  static async getInitialProps (ctx) {
    let initialProps = {};
    if (Component.getInitialProps) {
      initialProps = await Component.getInitialProps({ ...ctx });
    }

    return initialProps;
  }

  render () {
    const props = this.props;

    return props.isLoggedIn
      ? <Component {...props} />
      : <Unauthorized />;
  }
};

export default (Component) => withSession(restricted(Component));
