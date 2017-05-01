import Router from "next/router";
import Link from "next/link";
import React from "react";

import Session from "../../components/session";
import Layout from "../../components/Layout";

export default class extends React.Component {
  async componentDidMount () {
    const session = new Session();
    await session.getSession(true);
    Router.push("/");
  }

  render () {
    return (
      <Layout>
        <div className="container text-center">
          <p>You are now signed in.</p>
          <p><Link prefetch href="/"><a>Continue</a></Link></p>
        </div>
      </Layout>
    );
  }
}
