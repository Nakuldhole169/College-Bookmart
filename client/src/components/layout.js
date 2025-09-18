// import { useLocation } from "react-router-dom";
import NN from "./Navbar";
import Foot from "./Foot";

const Layout = ({ children }) => {
  // const location = useLocation();
  // const isHome = location.pathname === "/";

  return (
    <div className="app">
      { <NN />}
      <div className="content-container">{children}</div>
      <Foot />
    </div>
  );
};

export default Layout;
