import React from "react";
import fetch from "isomorphic-unfetch";

import Layout from "../../components/Layout";
import restricted from "../../components/restricted";


class TransportItem extends React.Component {

  confirmRemove = async () => {
    const { transport } = this.props;

    if (confirm("Are you sure you want to remove this address? This is irreversible")) {
      console.log("Deleting transport..");
      const resultProm = await fetch(`/api/transport/${transport._id}`, {
        method: "DELETE",
      });
      console.log("DELETED transport", transport._id);
      const result = resultProm.json();
      console.log(result);
    }
  }

  render () {
    const { transport } = this.props;

    return (
      <tr key={transport._id}>
        <td>
          {transport._id}
        </td>
        <td>
          {transport.email}
        </td>
        <td>
          {transport.host}
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

const Transports = (props) => (
  <Layout {...props}>
    <div className="container">
      <h2>
        Transports
      </h2>
      <table>
        <thead>
          <tr>
            <td>
              ID
            </td>
            <td>
              email
            </td>
            <td>
              host
            </td>
          </tr>
        </thead>
        <tbody>
          {props.transports.map(transport => (
            <TransportItem transport={transport} key={transport._id} />
          ))}
        </tbody>
      </table>
    </div>
  </Layout>
);

Transports.defaultProps = {
  transports: [],
};

Transports.getInitialProps = async ({ req }) => {
  const baseUrl = req ? `${req.protocol}://${req.get("Host")}` : "";
  const res = await fetch(`${baseUrl}/api/transport`);
  const data = await res.json();

  console.log("Transports", data.transports);

  return { transports: data.transports };
};

export default restricted(Transports);
