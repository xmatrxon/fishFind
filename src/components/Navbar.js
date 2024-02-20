import { useState } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

const Navbar = ({ authUser }) => {
  const [isActive, setIsActive] = useState(false);

  const toggleNavbar = () => {
    setIsActive(!isActive);
  };

  const closeNavbar = () => {
    setIsActive(false);
  };

  return (
    <div className="navbar">
      <Link to="/" className="home-link" onClick={closeNavbar}>
        FishFind
      </Link>
      <button className="toggle-button" onClick={toggleNavbar}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
      <div className={`navbar-links ${isActive ? "active" : ""}`}>
        <ul>
          <CustomLink to="/map" onClick={closeNavbar}>
            Mapa
          </CustomLink>
          <CustomLink to="/dashboard" onClick={closeNavbar}>
            Tablica
          </CustomLink>
          <CustomLink to="/account" onClick={closeNavbar}>
            Konto
          </CustomLink>
          {authUser ? (
            <CustomLink to="/logout" onClick={closeNavbar}>
              Wyloguj
            </CustomLink>
          ) : null}
        </ul>
      </div>
    </div>
  );
};

const CustomLink = ({ to, children, ...props }) => {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
};

export default Navbar;
