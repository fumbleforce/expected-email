import React from "react";
import Router from "next/router";

import withSession from "../../components/with-session";
import Session from "../../components/session";
import Layout from "../../components/Layout";

class SignIn extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      email: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
  }

  handleEmailChange (event) {
    this.setState({ email: event.target.value.trim() });
  }

  async handleSubmit (event) {
    event.preventDefault();

    const email = this.state.email;

    if (email === "" || email.length < 3) return;

    const session = new Session();
    session.signin(email)
    .then(() => {
      Router.push("/auth/check-email");
    })
    .catch(err => {
      // @FIXME Handle error
      console.error(err);
    });
  }

  renderSigninForm () {
    const { session } = this.props;

    if (session.user) {
      return null;
    }

    return (
      <div>
        <form id="signin" className="box text-center" method="post" action="/auth/email/signin" onSubmit={this.handleSubmit}>
          <input name="_csrf" type="hidden" value={session.csrfToken} />

          <h3>Sign in / register with email</h3>
          <p>
            <label htmlFor="email">Email address</label><br />
            <input
              name="email"
              type="text"
              placeholder="my@email.com"
              id="email"
              value={this.state.email}
              onChange={this.handleEmailChange}
            />
          </p>
          <p>
            <button id="submitButton" className="button-primary" type="submit">
              Sign in / register
            </button>
          </p>
        </form>

        <div className="box text-center">
          <h3>Sign in with service</h3>
          <p><a className="button button-primary button-facebook" href="/auth/oauth/facebook">Sign in with Facebook</a></p>
          <p><a className="button button-primary button-google" href="/auth/oauth/google">Sign in with Google</a></p>
          <p><a className="button button-primary button-twitter" href="/auth/oauth/twitter">Sign in with Twitter</a></p>
        </div>
      </div>
    );
  }

  render () {
    const { url } = this.props;

    return (
      <Layout url={url}>
        <div className="container">
          {this.renderSigninForm()}
        </div>
      </Layout>
    );
  }
}

// withSession can only be used on top level components (routes inside the pages directory)
export default withSession(SignIn);
