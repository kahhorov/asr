import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Masters from "./components/Page/Masters";
import Clients from "./components/Page/Clients";
import Debtors from "./components/Page/Debtors";
import { Route, Routes } from "react-router-dom";
import Main from "./components/Main";

function App() {
  // Savdo va accordionlar uchun state
  const [cartAccordions, setCartAccordions] = useState(() => {
    const saved = localStorage.getItem("cartAccordions");
    return saved ? JSON.parse(saved) : [];
  });

  // Login uchun state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Har safar cartAccordions o‘zgarsa localStorage ga saqlash
  useEffect(() => {
    localStorage.setItem("cartAccordions", JSON.stringify(cartAccordions));
  }, [cartAccordions]);

  // Login qilish
  const handleLogin = () => {
    if (email === "Asravto@gmail.com" && password === "asravto") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
    } else {
      alert("Email yoki parol noto‘g‘ri!");
    }
  };

  // Logout qilish
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  // Savatga qo‘shish
  const handleAddToCart = (newItem) => {
    setCartAccordions((prev) => [...prev, newItem]);
  };

  // Agar login qilmagan bo‘lsa faqat login sahifa chiqsin
  if (!isLoggedIn) {
    return (
      <div
        style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}
      >
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <button
          onClick={handleLogin}
          style={{ padding: "10px 20px", marginTop: "10px" }}
        >
          Login
        </button>
      </div>
    );
  }

  // Agar login bo‘lsa barcha komponentlar chiqadi
  return (
    <div>
      <Navbar cartAccordions={cartAccordions} onLogout={handleLogout} />

      <Routes path="/">
        <Route index element={<Main />} />
        <Route
          path="/masters"
          element={
            <Masters
              cartAccordions={cartAccordions}
              setCartAccordions={setCartAccordions}
              handleAddToCart={handleAddToCart}
            />
          }
        />

        <Route
          path="/clients"
          element={
            <Clients
              cartAccordions={cartAccordions}
              setCartAccordions={setCartAccordions}
              handleAddToCart={handleAddToCart}
            />
          }
        />
        <Route
          path="/debtors"
          element={
            <Debtors
              cartAccordions={cartAccordions}
              setCartAccordions={setCartAccordions}
              handleAddToCart={handleAddToCart}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
