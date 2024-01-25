import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Map from "./components/Map";
import Dashboard from "./components/Dashboard";
import { SignUp } from "./components/auth/SignUp";
import { SignIn } from "./components/auth/SignIn";
import Logout from "./components/auth/Logout";
import ResetPassword from "./components/ResetPassword";

import { useEffect, useState } from "react";
import ChangePassword from "./components/ChangePassword";
import ChangeUsername from "./components/ChangeUsername";
import WaterDetails from "./components/WaterDetails";
import NotFound from "./components/NotFound";
import PrivateRoutes from "./components/PrivateRoutes";
import PublicRoutes from "./components/PublicRoutes";
import { UserFetch } from "./components/UserFetch";
import { LoadingProvider } from "./components/LoadingContext";

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
        <LoadingProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map authUser={authUser} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard/:waterId"
              element={<WaterDetails authUser={authUser} />}
            />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />

            <Route element={<PrivateRoutes authUser={authUser} />}>
              <Route path="/logout" element={<Logout />} />
              <Route
                path="/changePassword"
                element={<ChangePassword authUser={authUser} />}
              />
              <Route
                path="/changeUsername"
                element={<ChangeUsername authUser={authUser} />}
              />
              <Route
                path="/account"
                element={<UserFetch authUser={authUser} />}
              />
            </Route>

            <Route element={<PublicRoutes authUser={authUser} />}>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
            </Route>
          </Routes>
        </LoadingProvider>
      </div>
    </>
  );
}

export default App;
