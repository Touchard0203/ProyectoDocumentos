import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import SuperAdminPage from "./pages/SuperAdminPage";
import AdminPage from "./pages/AdminPage";
import UsuarioPage from "./pages/UsuarioPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/superadmin/*" element={<SuperAdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/usuario/*" element={<UsuarioPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
