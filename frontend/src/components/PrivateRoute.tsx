// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useUserStore } from "../global/mode";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useUserStore();

  return currentUser ? children : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
