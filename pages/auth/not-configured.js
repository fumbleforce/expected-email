import Link from "next/link";

import Layout from "../../components/Layout";

export default () => (
  <Layout>
    <h2>Not configured</h2>
    <p>This oAuth provider has not been configured.</p>
    <p>Check the readme for instructions on how to configure oAuth providers</p>
    <p><Link prefetch href="/auth/signin"><a>Sign in via email</a></Link></p>
  </Layout>
);
