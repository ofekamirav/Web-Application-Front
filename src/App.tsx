import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Login from "./Components/Login"; 
import Register from "./Components/Register";
import { FC } from "react";
import "./Styles/App.css";
import  Homepage  from "./Components/Homepage";

const App: FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-wrap">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Homepage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;