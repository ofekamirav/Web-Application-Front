import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

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
    xmlns="http://www.w3.org/2000/svg"
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
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      setProfilePictureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
    }

    try {
      await registerUser(formData);
      navigate("/explore");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
    }/auth/google`;
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
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={isLoading}
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

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 hover:border-[#80813f] transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Sign in with Google
            </button>

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
