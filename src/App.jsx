import { Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Masters from "./components/Page/Masters";
import Clients from "./components/Page/Clients";
import Debtors from "./components/Page/Debtors";
import Main from "./components/Main";
import { Paper } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔹 global cartAccordions (localStorage bilan)
  const [cartAccordions, setCartAccordions] = useState(() => {
    const saved = localStorage.getItem("cartAccordions");
    return saved ? JSON.parse(saved) : [];
  });

  // har safar o‘zgarsa localStorage ga yozib qo‘yish
  useEffect(() => {
    localStorage.setItem("cartAccordions", JSON.stringify(cartAccordions));
  }, [cartAccordions]);

  // Mastersdan keladigan eventni ushlash
  const handleAddToCart = (data) => {
    setCartAccordions((prev) => [...prev, data]);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");
    const savedEmail = localStorage.getItem("email");

    if (savedLogin === "true" && savedEmail) {
      setIsLoggedIn(true);
      setEmail(savedEmail);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("❌ Iltimos email va parolni kiriting!", {
        position: "top-center",
      });
      return;
    }

    if (email === "Asravto@gmail.com" && password === "asravto") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("email", email);

      toast.success("👑 Admin panelga xush kelibsiz!", {
        position: "top-center",
      });

      setTimeout(() => navigate("/"), 1500);
    } else {
      toast.error("⛔ Sizga kirish mumkin emas!", {
        position: "top-center",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    localStorage.clear();
    toast.info("🔒 Logout qilindi!", { position: "top-center" });
    navigate("/");
  };

  // 🔹 umumiy hisoblash funksiyasi
  const calculateTotal = (arr) =>
    arr.reduce(
      (s, p) => s + (Number(String(p.price).replace(/[^0-9.-]+/g, "")) || 0),
      0
    );

  // Agar login qilinmagan bo‘lsa → Login page
  if (!isLoggedIn) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4b0082, #2e0854)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Paper
          elevation={8}
          style={{
            padding: "35px",
            borderRadius: "20px",
            width: "330px",
            background: "white",
          }}
        >
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "#444",
                marginBottom: "10px",
              }}
            >
              🔑 Admin Login
            </h2>

            <input
              type="email"
              placeholder="Email kiriting"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />

            <input
              type="password"
              placeholder="Parol kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #4b0082, #2e0854)",
                color: "white",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Login
            </button>
          </form>
        </Paper>

        <ToastContainer />
      </div>
    );
  }

  // 🔹 Asosiy UI (login qilingan bo‘lsa)
  return (
    <div>
      {/* Navbar */}
      <div
        style={{
          borderBottom: "2px solid #e0e0e0",
          boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Navbar
          cartAccordions={cartAccordions}
          calculateTotal={calculateTotal}
          handleLogout={handleLogout}
        />
      </div>

      {/* Routes */}
      <Routes>
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
            />
          }
        />
        <Route
          path="/debtors"
          element={
            <Debtors
              cartAccordions={cartAccordions}
              setCartAccordions={setCartAccordions}
            />
          }
        />
      </Routes>

      <ToastContainer />
    </div>
  );
}

export default App;
