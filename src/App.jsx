import { Route, Routes } from "react-router-dom";
import "./App.css";
// import Main from "./components/Main";
import Navbar from "./components/Navbar";
import Masters from "./components/Page/Masters";
import Clients from "./components/Page/Clients";
import Debtors from "./components/Page/Debtors";
import Main from "./components/Main";

function App() {
  return (
    <div>
      <Navbar />
      <Routes path="/">
        <Route index element={<Main />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/debtors" element={<Debtors />} />
      </Routes>
    </div>
  );
}

export default App;
