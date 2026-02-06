import React from "react";

function HomeMainLayout({ children }) {
  return (
    <div className="app-container">
      <div className="auth-container">{children}</div>
    </div>
  );
}

export default HomeMainLayout;
