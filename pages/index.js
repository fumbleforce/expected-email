import Link from "next/link";
import Layout from "../components/Layout";
import withSession from "../components/with-session";
import SignoutButton from "../components/signout-button";


const Index = (props) => (
  <Layout {...props}>
    {!props.isLoggedIn && <p><Link href="/auth/signin"><a>Login</a></Link></p>}
    {props.isLoggedIn && (
      <div>
        <p>Welcome back {props.session.user.email}</p>
      </div>
    )}
  </Layout>
);

export default withSession(Index);
