import React from "react";
import "./css/Navbar.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Foder";

function HomeLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default HomeLayout;
