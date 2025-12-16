import { Link } from "react-router-dom";

import "../assets/styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/" className="nav-logo">
          ProphetPredictor
        </Link>
      </div>
      <div className="nav-links-container">
        <Link to="/tutorial" className="nav-links">
          How To Use
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
