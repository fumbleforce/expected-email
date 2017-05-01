import React from "react";
import fetch from "isomorphic-unfetch";
import moment from "moment";
import Router from "next/router";

import Layout from "../../components/Layout";
import restricted from "../../components/restricted";
import Session from "../../components/session";

const renderTimeLeft = (mail) => {
  if (mail.sent) return "";

  const isOverdue = mail.sendAfter < +(new Date());
  if (isOverdue) return "Overdue";
  return moment(mail.sendAfter).fromNow();
};

class MailItem extends React.Component {
  confirmRemove = async () => {
    const { mail } = this.props;

    if (confirm("Are you sure you want to remove this mail? This is irreversible")) {
      console.log("Deleting mail..");
      const _csrf = await Session.getCsrfToken();
      const resultProm = await fetch(`/api/mail/${mail._id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": _csrf,
        },
        credentials: "include",
      });
      console.log("DELETED mail", mail._id);
      const result = await resultProm.json();
      console.log(result);
      location.reload();
    }
  }

  render () {
    const { mail } = this.props;

    return (
      <tr key={mail._id}>
        <td>
          {mail._id}
        </td>
        <td>
          {mail.subject}
        </td>
        <td>
          {new Date(mail.sendAfter).toString()}
        </td>
        <td>
          {mail.sent ? "Sent" : renderTimeLeft(mail)}
        </td>
        <td>
          <button
            className="button-primary"
            onClick={this.confirmRemove}
          >
            X
          </button>
        </td>
      </tr>
    );
  }
}

const Mails = (props) => (
  <Layout {...props}>
    <div className="container">
      <h2>
        Mails
      </h2>
      <table>
        <thead>
          <tr>
            <td>
              ID
            </td>
            <td>
              Subject
            </td>
            <td>
              Send after
            </td>
            <td>
              Delivery
            </td>
          </tr>
        </thead>
        <tbody>
          {props.mails.map(mail => (
            <MailItem mail={mail} key={mail._id} />
          ))}
        </tbody>
      </table>
    </div>
  </Layout>
);

Mails.defaultProps = {
  mails: [],
};

Mails.getInitialProps = async ({ req }) => {
  const baseUrl = req ? `${req.protocol}://${req.get("Host")}` : "";
  const res = await fetch(`${baseUrl}/api/mail`, req ? {
    headers: { cookie: req.headers.cookie }
  } : {});
  const { error, mails } = await res.json();

  if (error) {
    throw error;
  }

  return { mails };
};

export default restricted(Mails);
