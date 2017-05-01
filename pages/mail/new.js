import { Component } from "react";
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

const NewMailForm = ({ handleChange, handleDateChange, formData, transports }) => (
  <form onSubmit={e => e.preventDefault()}>
    <div className="row">
      <div className="six columns">
        <label htmlFor="from">
          From
        </label>
        <select id="from" name="from" onChange={handleChange}>
          <option value="">Choose address</option>
          {transports.map(t => (
            <option key={t._id} value={t._id}>{t.email}</option>
          ))}
        </select>
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

  </form>
);

NewMailForm.propTypes = {
  handleChange: func.isRequired,
  handleDateChange: func.isRequired,
};


class NewMail extends Component {
  static async getInitialProps ({ req }) {
    const baseUrl = req ? `${req.protocol}://${req.get("Host")}` : "";
    const res = await fetch(`${baseUrl}/api/transport`, req ? {
      headers: { cookie: req.headers.cookie }
    } : {});
    const { transports, error } = await res.json();

    if (error) {
      return console.error(error);
    }

    console.log("Transports", transports);

    return { transports };
  }

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

    const _csrf = this.props.session.csrfToken;

    console.log("csrf", _csrf);

    this.setState({ sending: true });
    console.log("Valid, adding mail");

    let result;
    try {
      const res = await fetch("/api/mail", {
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

      if (res.statu === 200) {
        result = await res.json();
      } else {
        console.error(res);
        return alert(await res.text());
      }
    } catch (e) { return console.error(e); }

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
    const { transports = [] } = this.props;

    return (
      <Layout {...this.props}>

        <div className="row">
          <div className="six columns border-right">
            <div className="sm-container">
              <h2>
                New mail
              </h2>
              <NewMailForm
                transports={transports}
                formData={formData}
                handleChange={this.handleChange}
                handleDateChange={this.handleDateChange}
              />
            </div>
          </div>
          <div className="six columns">
            <div className="sm-container">
              <NewMailView
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


export default restricted(NewMail);
