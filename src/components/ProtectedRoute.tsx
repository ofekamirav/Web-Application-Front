import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          style={{ height: 40 }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
