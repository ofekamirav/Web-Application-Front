import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";
import { GoogleLogin } from "@react-oauth/google";

type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
};

const defaultAvatar =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

const CheckIcon = () => (
  <svg
    className="w-4 h-4 inline-block mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
);

const RegisterPage = () => {
  const { register: registerUser, googleSignin } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>({ mode: "onTouched" });

  const passwordValue = watch("password", "");

  const passwordValidations = {
    hasLower: /(?=.*[a-z])/.test(passwordValue),
    hasUpper: /(?=.*[A-Z])/.test(passwordValue),
    hasNumber: /(?=.*\d)/.test(passwordValue),
    hasSpecial: /(?=.*[!@#$%^&*])/.test(passwordValue),
    isLongEnough: passwordValue.length >= 6,
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setProfilePictureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      await registerUser(formData);
      navigate("/explore");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message || "Registration failed. Please try again."
      );
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
              Create an Account
            </h1>
            <p className="text-gray-600 mb-8 text-center xl:text-left">
              Join our community and share your recipes
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              <div className="flex flex-col items-center space-y-2 mb-6">
                <img
                  src={previewUrl || defaultAvatar}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
                <label
                  htmlFor="profilePicture"
                  className="cursor-pointer text-sm text-[#80813f] hover:text-[#6f712e] font-semibold"
                >
                  {previewUrl ? "Change Picture" : "Upload Profile Picture"}
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading || isGoogleLoading}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  disabled={isLoading || isGoogleLoading}
                  {...register("name", { required: "Full Name is required" })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  disabled={isLoading || isGoogleLoading}
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
                  disabled={isLoading || isGoogleLoading}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                    pattern: {
                      value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                      message: "Password needs more complexity",
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
              </div>

              {passwordValue && (
                <div className="text-xs space-y-1">
                  <p
                    className={
                      passwordValidations.isLongEnough
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    <CheckIcon /> At least 6 characters long
                  </p>
                  <p
                    className={
                      passwordValidations.hasLower
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains a lowercase letter
                  </p>
                  <p
                    className={
                      passwordValidations.hasUpper
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains an uppercase letter
                  </p>
                  <p
                    className={
                      passwordValidations.hasNumber
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains a number
                  </p>
                  <p
                    className={
                      passwordValidations.hasSpecial
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains a special character (!@#$%^&*)
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-[#80813f] hover:bg-[#6f712e] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    style={{ height: 40 }}
                  />
                ) : (
                  "Sign Up"
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
                    text="signup_with"
                    type="standard"
                    width="100%"
                  />
                </div>
              </div>
            </div>

            <p className="text-center text-gray-600 text-sm mt-8">
              Do you already have an account?{" "}
              <Link
                to="/login"
                className="text-[#80813f] hover:text-[#6f712e] font-bold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
