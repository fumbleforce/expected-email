/* global window */
import React from "react";
import Session from "./session";

async function signout (event) {
  event.preventDefault();

  const session = new Session();
  await session.signout();

  // @FIXME next/router not working reliably  so using window.location
  window.location = "/";
}

export default ({ session, children, ...other }) => {
  if (!session || !session.user) {
    return false;
  }

  return (
    <form id="signout" method="post" action="/auth/signout" onSubmit={signout} {...other}>
      <input name="_csrf" type="hidden" value={session.csrfToken} />
      <button className="button-primary" type="submit">{children}</button>
    </form>
  );
};
