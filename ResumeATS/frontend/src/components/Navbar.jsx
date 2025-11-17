import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const navStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 80px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "none",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    color: "white",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    zIndex: 1000
  };

  const logoStyle = {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff 0%, #ffd89b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  };

  const linkContainerStyle = {
    display: "flex",
    gap: "40px",
    alignItems: "center"
  };

  const getLinkStyle = (path) => ({
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    background: location.pathname === path ? "rgba(255, 255, 255, 0.15)" : "transparent",
    border: location.pathname === path ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent"
  });

  const handleMouseEnter = (e) => {
    e.target.style.background = "rgba(255, 255, 255, 0.2)";
    e.target.style.transform = "translateY(-2px)";
  };

  const handleMouseLeave = (e, path) => {
    if (location.pathname !== path) {
      e.target.style.background = "transparent";
    } else {
      e.target.style.background = "rgba(255, 255, 255, 0.15)";
    }
    e.target.style.transform = "translateY(0)";
  };

  return (
    <nav style={navStyle}>
      <h2 style={logoStyle}>✨ Resume Analyzer</h2>
      <div style={linkContainerStyle}>
        <Link 
          to="/" 
          style={getLinkStyle("/")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={(e) => handleMouseLeave(e, "/")}
        >
          Home
        </Link>
        <Link 
          to="/analyze" 
          style={getLinkStyle("/analyze")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={(e) => handleMouseLeave(e, "/analyze")}
        >
          Analyze
        </Link>
        <Link 
          to="/contact" 
          style={getLinkStyle("/contact")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={(e) => handleMouseLeave(e, "/contact")}
        >
          Contact Us
        </Link>
      </div>
    </nav>
  );
}
