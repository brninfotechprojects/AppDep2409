import logo from "./logo.svg";
import "./App.css";
import Signup from "./components/Signup";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Leaves from "./components/Leaves";
import EditProfile from "./components/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/" element={<Login />}></Route>
        <Route path="/tasks" element={<Tasks />}></Route>
        <Route path="/leaves" element={<Leaves />}></Route>
        <Route path="/editProfile" element={<EditProfile />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
