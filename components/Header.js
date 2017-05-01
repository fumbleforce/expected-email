import Link from "next/link";

import SignoutButton from "./signout-button";

const Header = ({ url, session, isLoggedIn }) => (
  <header>

    <Link href="/">
      <a style={{ padding: "10px 26px" }} className={url.pathname === "/" ? "active" : ""}>
        <img className="logo" src="/static/img/logo.svg" />
      </a>
    </Link>

    {isLoggedIn && (
      <Link href="/mail">
        <a className={url.pathname === "/mail" ? "active" : ""}>Mails</a>
      </Link>
    )}
    {isLoggedIn && (
      <Link href="/mail/new">
        <a className={url.pathname === "/mail/new" ? "active" : ""}>New mail</a>
      </Link>
    )}
    {isLoggedIn && (
      <Link href="/transport">
        <a className={url.pathname === "/transport" ? "active" : ""}>Transports</a>
      </Link>
    )}
    {isLoggedIn && (
      <Link href="/transport/new">
        <a className={url.pathname === "/transport/new" ? "active" : ""}>New transport</a>
      </Link>
    )}

    {!isLoggedIn && (
      <Link href="/auth/signin">
        <a className={url.pathname === "/auth/signin" ? "active" : ""}>Sign in</a>
      </Link>
    )}

    {isLoggedIn && (
      <SignoutButton style={{ float: "right", margin: "10px" }} session={session}>Sign out</SignoutButton>
    )}
  </header>
);

export default Header;
