import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  
    const location = useLocation();

  return (
    <div>
      <nav>
        <Link to="/"></Link>
        <Link to="/stats"></Link>
        <Link to="/tracker"></Link>
        <Link to="/profilePage"></Link>
      </nav>
    </div>
  );
};

export default Navbar;
