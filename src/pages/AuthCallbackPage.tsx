import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      handleAuthCallback(accessToken, refreshToken)
        .then(() => {
          navigate("/explore");
        })
        .catch((err) => {
          console.error("Failed to handle auth callback:", err);
          navigate("/login?error=auth_failed");
        });
    } else {
      navigate("/login?error=missing_tokens");
    }
  }, [searchParams, navigate, handleAuthCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Lottie animationData={loadingAnimation} loop style={{ height: 200 }} />
    </div>
  );
};

export default AuthCallbackPage;
