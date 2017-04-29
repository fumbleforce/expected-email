import { Component } from "react";
import Link from "next/link";
import Datetime from "react-datetime";
import fetch from "isomorphic-unfetch";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";

import Layout from "../../components/Layout";
import restricted from "../../components/restricted";

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

const NewMailView = ({ formData }) => (
  <div>
    <div>
      {formData.from || <ErrorMessage>Missing from</ErrorMessage>}
    </div>
    <div>
      To: {formData.to || <ErrorMessage>Missing to</ErrorMessage>}
    </div>
    <div>
      {
        formData.sendAfter
        ? `${(new Date(formData.sendAfter)).toString()}  ${moment(formData.sendAfter).fromNow()}`
        : <ErrorMessage>Missing date</ErrorMessage>}
    </div>
    <hr />
    <div>
      {formData.subject
        ? <h4>{formData.subject}</h4>
        : <ErrorMessage>Missing subject</ErrorMessage>}
    </div>
    <div>
      {formData.text
        ? <pre>{formData.text}</pre>
        : <ErrorMessage>Missing text</ErrorMessage>}
    </div>
  </div>
);

NewMailView.propTypes = {
  formData: shape({
    from: string,
    to: string,
    sendAfter: number,
    subject: string,
    text: string,
  }).isRequired,
};

const NewMailForm = ({ handleChange, handleSubmit, handleDateChange, sending, formData }) => (
  <form onSubmit={handleSubmit}>
    <div className="row">
      <div className="six columns">
        <label htmlFor="from">
          From
        </label>
        <input
          className="u-full-width"
          onChange={handleChange}
          type="email"
          name="from"
          id="from"
        />
      </div>
      <div className="six columns">
        <label htmlFor="to">
          To
        </label>
        <input
          className="u-full-width"
          onChange={handleChange}
          type="email"
          name="to"
          id="to"
        />
      </div>
    </div>

    <label htmlFor="subject">
      Subject
    </label>
    <input
      className="u-full-width"
      onChange={handleChange}
      type="text"
      name="subject"
      id="subject"
    />

    <label htmlFor="text">
      Text
    </label>
    <textarea
      className="u-full-width"
      placeholder="Hi Dave …"
      name="text"
      onChange={handleChange}
      id="text"
    />

    <label htmlFor="sendAfter">
      Send after
    </label>
    <div>
      {formData.sendAfter && moment(formData.sendAfter).fromNow()}
    </div>
    <Datetime
      locale="nn"
      utc={false}
      onChange={handleDateChange}
    />

    {!sending && (
      <input className="button-primary" type="submit" value="Submit" />
    )}
  </form>
);

NewMailForm.propTypes = {
  handleChange: func.isRequired,
  handleDateChange: func.isRequired,
  handleSubmit: func.isRequired,
};


class NewMail extends Component {
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

  handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "from",
      "to",
      "sendAfter",
      "subject",
      "text",
    ];

    const formData = this.state.formData;
    console.log("Submit", formData);

    if (!_.every(requiredFields, f => !!formData[f])) {
      alert("Missing fields");
      return;
    }

    this.setState({ sending: true });
    console.log("Valid, adding mail");

    const res = await fetch("/api/mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (result.success) {
      alert("Scheduled mail");
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
                New mail
              </h2>
              <NewMailForm
                sending={sending}
                formData={formData}
                handleChange={this.handleChange}
                handleDateChange={this.handleDateChange}
                handleSubmit={this.handleSubmit}
              />
            </div>
          </div>
          <div className="six columns">
            <div className="sm-container">
              <NewMailView
                formData={formData}
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}


export default restricted(NewMail);
