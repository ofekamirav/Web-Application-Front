import { FC } from "react";
import logo from "../assets/logo.png";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";

const Navbar: FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand me-2">
          <img
            src={logo}
            height="50"
            alt="recipe Logo"
            loading="lazy"
            style={{ marginTop: "-1px" }}
          />
          RecipeHub
        </a>
        <button
          data-mdb-collapse-init
          className="navbar-toggler"
          type="button"
          data-mdb-target="#navbarButtonsExample"
          aria-controls="navbarButtonsExample"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarButtonsExample">
          <div className="row w-100">
            <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
              <form className="d-flex w-100">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
              </form>
            </div>
          </div>

          <div className="d-flex align-items-center ms-auto">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Map
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Profile
                </a>
              </li>
            </ul>
            <Link to="/login" className="login-btn">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
