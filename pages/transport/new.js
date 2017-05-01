import { Component } from "react";
import Link from "next/link";
import Router from "next/router";
import fetch from "isomorphic-unfetch";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";

import Layout from "../../components/Layout";
import restricted from "../../components/restricted";
import Session from "../../components/session";

const { shape, number, string, node, func } = PropTypes;

const errorStyle = {
  color: "tomato",
};

const ErrorMessage = ({ children }) => (
  <span style={errorStyle}>{children}</span>
);

ErrorMessage.propTypes = {
  children: node.isRequired,
};

const NewTransportView = ({ formData }) => (
  <div>
    <div>
      {formData.email || <ErrorMessage>Missing email</ErrorMessage>}
    </div>
    <div>
      {formData.host || <ErrorMessage>Missing host</ErrorMessage>}
    </div>
    <div>
      {formData.user
        ? <h4>{formData.user}</h4>
        : <ErrorMessage>Missing user</ErrorMessage>}
    </div>
    <div>
      {formData.password
        ? <pre>******</pre>
        : <ErrorMessage>Missing password</ErrorMessage>}
    </div>
  </div>
);

NewTransportView.propTypes = {
  formData: shape({
    email: string,
    host: string,
    user: string,
    password: string,
  }).isRequired,
};

const NewTransportForm = ({ handleChange }) => (
  <form onSubmit={e => e.preventDefault()}>
    <label htmlFor="email">
      Email address
    </label>
    <input
      className="u-full-width"
      onChange={handleChange}
      type="email"
      name="email"
      id="email"
    />

    <label htmlFor="host">
      SMTP Host
    </label>
    <input
      className="u-full-width"
      onChange={handleChange}
      type="text"
      name="host"
      id="host"
    />

    <label htmlFor="user">
      User
    </label>
    <input
      className="u-full-width"
      onChange={handleChange}
      name="user"
      type="text"
      id="user"
    />

    <label htmlFor="password">
      Password
    </label>
    <input
      className="u-full-width"
      onChange={handleChange}
      name="password"
      type="password"
      id="password"
    />

  </form>
);

NewTransportForm.propTypes = {
  handleChange: func.isRequired,
};


class NewTransport extends Component {
  state = {
    formData: {},
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    const formData = this.state.formData;
    console.log("Setting", name, "to", value);
    formData[name] = value;
    this.setState({ formData });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = [
      "email",
      "host",
      "user",
      "password",
    ];

    const formData = this.state.formData;
    console.log("Submit", formData);

    if (!_.every(requiredFields, f => !!formData[f])) {
      alert("Missing fields");
      return;
    }

    const _csrf = await Session.getCsrfToken();

    this.setState({ sending: true });

    let result;
    try {
      const res = await fetch("/api/transport", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _csrf,
          ...formData
        }),
      });

      if (res.status === 200) {
        result = await res.json();
      } else {
        console.error(res);
        return alert(await res.text());
      }
    } catch (e) { return console.error(e); }

    if (result.success) {
      alert("added transport");
      Router.push("/transport");
    } else {
      alert(result.error);
    }

    this.setState({ sending: false });
  }

  handleDateChange = (time) => {
    const formData = this.state.formData;

    if (typeof time === "string") return;

    if (time.isBefore(new Date())) {
      console.error("Time is before now");
      formData.sendAfter = null;
      this.setState({ formData });
      return;
    }

    formData.sendAfter = +moment(time);
    this.setState({ formData });
  }

  render () {
    const { formData, sending } = this.state;

    return (
      <Layout {...this.props}>

        <div className="row">
          <div className="six columns border-right">
            <div className="sm-container">
              <h2>
                New Transport
              </h2>
              <NewTransportForm
                formData={formData}
                handleChange={this.handleChange}
                handleDateChange={this.handleDateChange}
              />
            </div>
          </div>
          <div className="six columns">
            <div className="sm-container">
              <NewTransportView
                formData={formData}
              />
            </div>
            <div className="text-center spaced">
              {!sending && (
                <button
                  className="button-primary"
                  onClick={this.handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}


export default restricted(NewTransport);
