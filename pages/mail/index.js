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
              Sent
            </td>
            <td>
              Overdue
            </td>
          </tr>
        </thead>
        <tbody>
          {props.mails.map(mail => (
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
                {mail.sent && "Sent"}
              </td>
              <td>
                {renderTimeLeft(mail)}
              </td>
            </tr>
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
  console.log("BASE URL", baseUrl);
  const res = await fetch(`${baseUrl}/api/mail`);
  const data = await res.json();

  console.log(data.mails);

  return { mails: data.mails };
};

export default restricted(Mails);
