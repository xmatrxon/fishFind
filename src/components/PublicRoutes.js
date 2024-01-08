import { Outlet, Navigate } from "react-router-dom";

const PublicRoutes = ({ authUser }) => {
  return authUser ? <Navigate to="account" /> : <Outlet />;
};

export default PublicRoutes;
