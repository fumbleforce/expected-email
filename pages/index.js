import Link from "next/link";
import Layout from "../components/Layout";
import withSession from "../components/with-session";

const renderFrontpage = () => (
  <div className="container">
    <h1 className="text-center">
      Send emails later
    </h1>

    <p className="sm-container box">
      {"Does it annoy you that you can't send emails\
      when you want to? In most email clients, like gmail,\
      it's now or never, unless you have an extension that you pay for.\
      Well no more of that! This tiny service allows you to schedule\
      emails for future sending."}
    </p>

    <div className="sm-container spaced text-center">
      <Link prefetch href="/auth/signin">
        <button className="button-primary">
          Try it out!
        </button>
      </Link>
    </div>
  </div>
);

const renderHomepage = props => (
  <div className="container text-center">
    <p>Welcome back {props.session.user.email}</p>
  </div>
);

const Index = (props) => {
  console.log("Rendering index");
  return (
    <Layout {...props}>
      {!props.isLoggedIn && renderFrontpage()}
      {props.isLoggedIn && renderHomepage(props)}
    </Layout>
  );
};

export default withSession(Index);
