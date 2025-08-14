import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";
import { GoogleLogin } from "@react-oauth/google";

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const { login, googleSignin } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate("/explore");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col xl:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div
          className="w-full xl:w-1/2 bg-cover bg-center relative min-h-[300px] xl:min-h-[700px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?q=80&w=2092&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>

        <div className="w-full xl:w-1/2 flex items-center justify-center p-8 xl:p-16">
          <div className="w-full max-w-md">
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-800 mb-3 text-center xl:text-left">
              Welcome Back!
            </h1>
            <p className="text-gray-600 mb-8 text-center xl:text-left">
              Log in to discover new recipes
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email Address is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address format",
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-[#80813f] hover:bg-[#6f712e] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                {isLoading ? (
                  <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    style={{ height: 40 }}
                  />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <div className="mt-4">
              <div className="flex justify-center">
                <div style={{ width: "100%" }}>
                  <GoogleLogin
                    onSuccess={async (cred) => {
                      const idToken = cred.credential;
                      if (!idToken) return;
                      setIsGoogleLoading(true);
                      setError(null);
                      try {
                        await googleSignin(idToken);
                        navigate("/explore");
                      } catch (e) {
                        console.error("Google sign-in failed", e);
                        setError("Google sign-in failed. Please try again.");
                      } finally {
                        setIsGoogleLoading(false);
                      }
                    }}
                    onError={() =>
                      setError("Google sign-in failed. Please try again.")
                    }
                    theme="outline"
                    shape="rectangular"
                    size="large"
                    text="signin_with"
                    width="100%"
                  />
                </div>
              </div>
            </div>

            <p className="text-center text-gray-600 text-sm mt-8">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className=" text-[#80813f] hover:text-[#6f712e] font-bold"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
