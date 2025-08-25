import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Masters from "./components/Page/Masters";
import Clients from "./components/Page/Clients";
import Debtors from "./components/Page/Debtors";
import Main from "./components/Main";
import "./App.css";
import { Button } from "@mui/material";
import Balanis from "./components/Balanis";

function App() {
  // cartAccordions (to‘langan/to‘lanmagan) — localStorage bilan sinxron
  const [cartAccordions, setCartAccordions] = useState(() => {
    const saved = localStorage.getItem("cartAccordions");
    return saved ? JSON.parse(saved) : [];
  });

  // Login holati
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Har safar cartAccordions o‘zgarsa localStorage ga yozish
  useEffect(() => {
    try {
      localStorage.setItem("cartAccordions", JSON.stringify(cartAccordions));
    } catch (e) {
      console.error("LocalStorage yozishda xato:", e);
    }
  }, [cartAccordions]);

  // Login
  const handleLogin = () => {
    if (email === "Asravto@gmail.com" && password === "asravto") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
    } else {
      alert("Email yoki parol noto‘g‘ri!");
    }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  // Masters page’dan yangi accordion qo‘shish
  // App.js
  const handleAddToCart = (newItem) => {
    setCartAccordions((prev) => [
      ...prev,
      {
        ...newItem,
        createdAt: new Date().toISOString(),
        status: newItem.status || "to'lanmagan",
        price: newItem.products.reduce(
          (sum, p) => sum + Number(p.price || 0),
          0
        ),
      },
    ]);
  };

  // Login sahifasi
  if (!isLoggedIn) {
    return (
      <div
        style={{
          width: "100%",
          textAlign: "center",
          padding: "0 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
        className="liner"
      >
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "200px",
            padding: "15px",
            margin: "10px 0",
            color: "#000",
          }}
        />
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "200px",
            padding: "15px",
            margin: "10px 0",
            color: "#000",
          }}
        />
        <Button
          variant="outlined"
          onClick={handleLogin}
          style={{ padding: "10px 20px", marginTop: "10px" }}
        >
          Login
        </Button>
      </div>
    );
  }

  // Asosiy App
  return (
    <div>
      <Navbar
        cartAccordions={cartAccordions}
        setCartAccordions={setCartAccordions}
        onLogout={handleLogout}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Main
              cartAccordions={cartAccordions}
              handleAddToCart={handleAddToCart}
            />
          }
        />
        <Route path="/clients" element={<Clients />} />
        <Route path="/debtors" element={<Debtors />} />
        <Route
          path="/balanis"
          element={<Balanis cartAccordions={cartAccordions} />}
        />
      </Routes>
    </div>
  );
}

export default App;
