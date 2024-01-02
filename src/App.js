import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Map from "./components/Map";
import Dashboard from "./components/Dashboard";
import Account from "./components/Account";
import { SignUp } from "./components/auth/SignUp";
import { SignIn } from "./components/auth/SignIn";
import Logout from "./components/auth/Logout";
import ResetPassword from "./components/ResetPassword";

import { useEffect, useState } from "react";
import ChangePassword from "./components/ChangePassword";
import ChangeUsername from "./components/ChangeUsername";
import WaterDetails from "./components/WaterDetails";

function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      listen();
    };
  }, []);

  return (
    <>
      <Navbar authUser={authUser} />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map authUser={authUser} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard/:waterId"
            element={<WaterDetails authUser={authUser} />}
          />
          <Route path="/account" element={<Account authUser={authUser} />} />
          <Route path="/signup" element={<SignUp authUser={authUser} />} />
          <Route path="/signin" element={<SignIn authUser={authUser} />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/changePassword"
            element={<ChangePassword authUser={authUser} />}
          />
          <Route
            path="/changeUsername"
            element={<ChangeUsername authUser={authUser} />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
