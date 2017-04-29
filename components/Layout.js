import PropTypes from "prop-types";
import Header from "./Header";


const Layout = (props) => (
  <div className="layout">
    <Header {...props} />
    <main className="fade-in">
      {props.children}
    </main>
  </div>
);

Layout.defaultProps = {
  url: { pathname: "" }
};

export default Layout;
