import React from "react";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import moment from "moment";

import Layout from "../../components/Layout";
import restricted from "../../components/restricted";

const renderTimeLeft = (mail) => {
  if (mail.sent) return "";

  const isOverdue = mail.sendAfter < +(new Date());
  if (isOverdue) return "Overdue";
  return moment(mail.sendAfter).fromNow();
};

class MailItem extends React.Component {

  confirmRemove = () => {
    const { mail } = this.props;

    confirm("Are you sure you want to remove this mail? This is irreversible", agree => {
      console.log(agree);
      if (agree) {
        console.log("Deleting mail..");
        fetch(`/api/mail/${mail._id}`, {
          method: "DELETE",
        }, resultProm => {
          console.log("DELETED mail", mail._id);
          const result = resultProm.json();
          console.log(result);
        });
      }
    });
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
  const res = await fetch(`${baseUrl}/api/mail`);
  const data = await res.json();

  console.log("Mails", data.mails);

  return { mails: data.mails };
};

export default restricted(Mails);
