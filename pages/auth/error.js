import Link from "next/link";

import Layout from "../../components/Layout";

export default () => (
  <Layout>
    <div className="container text-center">
      <h2>Unable to sign in</h2>
      <p>The link you tried to use to sign in was not valid.</p>
      <p><Link prefetch href="/auth/signin"><a>Request a new one to sign in.</a></Link></p>
    </div>
  </Layout>
);
