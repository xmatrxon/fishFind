import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = ({ authUser }) => {
  return authUser ? <Outlet /> : <Navigate to="signin" />;
};

export default PrivateRoutes;
