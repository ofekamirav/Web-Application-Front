import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Login from "./Components/Login"; // Import the Login component
import { FC } from "react";
import "./Styles/App.css";

const App: FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-wrap">
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;