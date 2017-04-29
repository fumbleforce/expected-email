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

export default (Component) => {
  const checkAuth = (props) => props.isLoggedIn ? <Component {...props} /> : <Unauthorized />;

  return withSession(checkAuth);
};
