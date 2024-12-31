import logo from "./assets/logo.png";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <img
        src={logo}
        alt="logo"
        width="35"
        height="35"
        className="d-inline-block align-top"
      />
      <a className="navbar-brand" href="/">
        RecipeHub
      </a>
    </nav>
  );
}

export default Navbar;
