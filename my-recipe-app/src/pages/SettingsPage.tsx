import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  apiGetCurrentUserProfile,
  apiUpdateCurrentUserProfile,
  apiDeleteCurrentUser,
  apiUpdateCurrentUserPassword,
} from "../api/userService";

type ProfileForm = {
  name: string;
  email: string;
  profileImage: FileList;
};

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const CheckIcon = () => (
  <svg
    className="w-4 h-4 inline-block mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const oliveBg = "bg-[#808c3c]";
const oliveBgHover = "hover:bg-[#6e7a32]";
const oliveText = "text-[#808c3c]";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ----- Profile form -----
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const { ref: imgRef, ...imgReg } = register("profileImage");

  const watchedImage = watch("profileImage");
  useEffect(() => {
    if (watchedImage?.[0]) setImgPreview(URL.createObjectURL(watchedImage[0]));
    else setImgPreview(null);
  }, [watchedImage]);

  useEffect(() => {
    reset({ name: user?.name ?? "", email: user?.email ?? "" });
    setImgPreview(null);
  }, [user, reset]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      const dt = new DataTransfer();
      dt.items.add(f);
      setValue("profileImage", dt.files, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setImgPreview(URL.createObjectURL(f));
      trigger("profileImage");
    }
  };

  const onChooseFile = () => fileInputRef.current?.click();

  const saveProfile = handleSubmit(async (data) => {
    setIsSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append("name", data.name.trim());
      fd.append("email", data.email.trim().toLowerCase());
      if (data.profileImage?.[0]) {
        fd.append("profileImage", data.profileImage[0]);
      }
      const updated = await apiUpdateCurrentUserProfile(fd);
      setUser(updated);
    } catch (e) {
      console.error(e);
      alert("Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  });

  // ----- Change password form -----
  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    watch: watchPwd,
    formState: { errors: pwdErrors, isSubmitting: isChangingPassword },
  } = useForm<PasswordForm>({
    mode: "onTouched",
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPwd = watchPwd("newPassword") || "";
  const pwdChecks = {
    hasLower: /(?=.*[a-z])/.test(newPwd),
    hasUpper: /(?=.*[A-Z])/.test(newPwd),
    hasNumber: /(?=.*\d)/.test(newPwd),
    hasSpecial: /(?=.*[!@#$%^&*])/.test(newPwd),
    isLongEnough: newPwd.length >= 6,
  };

  const changePassword = handleSubmitPwd(
    async ({ oldPassword, newPassword, confirmPassword }) => {
      if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
      }
      try {
        await apiUpdateCurrentUserPassword(oldPassword, newPassword);
        resetPwd();
        alert("Password changed successfully.");
      } catch (e) {
        console.error(e);
        alert("Failed to change password.");
      }
    }
  );

  // ----- Delete account -----
  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      return alert('Please type "DELETE" to confirm.');
    }
    setIsDeleting(true);
    try {
      await apiDeleteCurrentUser();
      await logout();
      window.location.href = "/register";
    } catch (e) {
      console.error(e);
      alert("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-8 text-center">
          <p className="text-gray-700">
            Please{" "}
            <Link className={`${oliveText} font-semibold`} to="/login">
              log in
            </Link>{" "}
            to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account and profile.</p>
        </div>
        <Link
          to="/my-recipes"
          className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm font-semibold hover:text-white text-white ${oliveBg} ${oliveBgHover}`}
        >
          My Recipes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile (left) */}
        <section className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>

          <form onSubmit={saveProfile} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="w-full rounded-xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full rounded-xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Changing email may require re-login.
                </p>
              </div>
            </div>

            {/* Avatar uploader */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile picture
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={onDrop}
                onClick={onChooseFile}
                className={[
                  "w-full rounded-2xl border-2 border-dashed p-6 transition cursor-pointer",
                  dragActive
                    ? "border-gray-400 bg-gray-50"
                    : "border-gray-300 hover:border-gray-400",
                ].join(" ")}
                role="button"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      imgPreview ??
                      user.profilePicture ??
                      "https://placehold.co/120x120/e0e0e0/757575?text=Avatar"
                    }
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover ring-1 ring-gray-200"
                  />
                  <div>
                    <p className="text-sm text-gray-700">
                      Drag & drop an image, or{" "}
                      <span className={`${oliveText} font-semibold`}>
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG/PNG, up to ~5MB.
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  {...imgReg}
                  ref={(el) => {
                    imgRef(el);
                    fileInputRef.current = el;
                  }}
                  className="hidden"
                  onChange={() => trigger("profileImage")}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingProfile || !isDirty}
                className={`inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-white ${oliveBg} ${oliveBgHover} disabled:opacity-60`}
              >
                {isSavingProfile ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const fresh = await apiGetCurrentUserProfile();
                    setUser(fresh);
                    reset({ name: fresh.name, email: fresh.email });
                    setImgPreview(null);
                  } catch {
                    reset({ name: user.name, email: user.email });
                    setImgPreview(null);
                  }
                }}
                className="inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* Right column: Security + Danger zone */}
        <div className="lg:col-span-1 space-y-8">
          <section className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>

            {typeof user.provider === "string" &&
            user.provider !== "Regular" ? (
              <p className="mt-3 text-sm text-gray-600">
                You signed in with Google. Password is managed by Google.
              </p>
            ) : (
              <form onSubmit={changePassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current password
                  </label>
                  <input
                    type="password"
                    {...registerPwd("oldPassword", { required: "Required" })}
                    className="w-full rounded-xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                  />
                  {pwdErrors.oldPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {pwdErrors.oldPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    {...registerPwd("newPassword", {
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
                    className="w-full rounded-xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                  />
                  {pwdErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {pwdErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <p
                    className={
                      pwdChecks.isLongEnough
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    <CheckIcon /> At least 6 characters long
                  </p>
                  <p
                    className={
                      pwdChecks.hasLower ? "text-green-600" : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains a lowercase letter
                  </p>
                  <p
                    className={
                      pwdChecks.hasUpper ? "text-green-600" : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains an uppercase letter
                  </p>
                  <p
                    className={
                      pwdChecks.hasNumber ? "text-green-600" : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains a number
                  </p>
                  <p
                    className={
                      pwdChecks.hasSpecial ? "text-green-600" : "text-gray-500"
                    }
                  >
                    <CheckIcon /> Contains a special character (!@#$%^&*)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    {...registerPwd("confirmPassword", {
                      required: "Required",
                      validate: (v) => v === newPwd || "Passwords do not match",
                    })}
                    className="w-full rounded-xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                  />
                  {pwdErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {pwdErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className={`mt-2 inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-[#808c3c] hover:bg-[#6e7a32] disabled:opacity-60`}
                >
                  {isChangingPassword ? "Changing…" : "Change password"}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl ring-1 ring-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">Danger zone</h2>
            <p className="mt-2 text-sm text-red-700">
              This will permanently delete your account and all your recipes &
              comments.
            </p>
            <div className="mt-3">
              <label className="block text-xs font-medium text-red-800 mb-1">
                Type <b>DELETE</b> to confirm
              </label>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded-xl border-red-200 bg-white p-2 text-sm focus:border-red-300 focus:ring-0"
                placeholder="DELETE"
              />
            </div>
            <button
              onClick={deleteAccount}
              disabled={isDeleting}
              className="mt-3 inline-flex rounded-2xl px-4 py-2 text-sm font-semibold hover:border-none text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
            >
              {isDeleting ? "Deleting…" : "Delete account"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
