import { Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Masters from "./components/Page/Masters";
import Clients from "./components/Page/Clients";
import Debtors from "./components/Page/Debtors";
import Main from "./components/Main";
import {
  Drawer,
  IconButton,
  Avatar,
  Divider,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

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
      // ✅ To‘g‘ri admin login
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("email", email);

      toast.success("👑 Admin panelga xush kelibsiz!", {
        position: "top-center",
      });

      setTimeout(() => navigate("/"), 1500);
    } else {
      // ❌ Xato email yoki parol
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

  return (
    <div>
      {/* Navbar */}
      <div
        style={{
          borderBottom: "2px solid #e0e0e0",
          boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Navbar />
      </div>

      {/* Account Icon */}
      <IconButton
        onClick={() => setPanelOpen(true)}
        style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}
      >
        <AccountCircleIcon style={{ fontSize: 40, color: "#4b0082" }} />
      </IconButton>

      {/* Account Drawer */}
      <Drawer
        anchor="right"
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      >
        <Box
          sx={{
            width: 300,
            padding: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: "#4b0082",
              alignSelf: "center",
            }}
          >
            {email.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" sx={{ textAlign: "center", width: "100%" }}>
            {email}
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: "center", width: "100%" }}
          >
            👑 Admin
          </Typography>
          <Divider sx={{ width: "100%", my: 2 }} />
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            // fullWidth
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Routes */}
      <Routes>
        <Route index element={<Main />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/debtors" element={<Debtors />} />
      </Routes>

      <ToastContainer />
    </div>
  );
}

export default App;
