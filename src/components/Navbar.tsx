import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { publicUrl } from "../utils/publicUrl";

const olive = "text-[#808c3c]";
const oliveBg = "bg-[#808c3c]";
const oliveBgHover = "hover:bg-[#6e7a32]";
const oliveTextHover = "hover:text-[#6e7a32]";

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // shadow/blur after scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close profile dropdown on outside click / Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node))
        setIsProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const linkBase =
    "inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-colors";
  const linkActive = `${olive} font-semibold`;
  const mobileLink =
    "block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:text-white hover:bg-[#808c3c]";

  return (
    <nav
      className={[
        "sticky top-0 z-50 backdrop-blur-md",
        "bg-white/85",
        scrolled ? "shadow-sm ring-1 ring-gray-200" : "shadow-none",
      ].join(" ")}
      aria-label="Main Navigation"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`text-2xl font-extrabold ${olive} ${oliveTextHover} tracking-tight`}
              aria-label="RecipeHub Home"
            >
              RecipeHub
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-6">
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? linkActive
                    : "hover:text-[#6e7a32] " + oliveTextHover
                }`
              }
            >
              Explore
            </NavLink>

            {/* CTA – Create */}
            {user && (
              <>
                <NavLink
                  to="/create-recipe"
                  className={({ isActive }) =>
                    [
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                      oliveBg,
                      oliveBgHover,
                      "shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#808c3c]/70 hover:text-white",
                      isActive ? "brightness-95" : "",
                    ].join(" ")
                  }
                  aria-label="Create Recipe"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="opacity-90"
                    aria-hidden
                  >
                    <path
                      d="M12 5v14m-7-7h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Create
                </NavLink>
                <NavLink
                  to="/ai"
                  className={({ isActive }) =>
                    [
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-white ring-1 ring-[#808c3c] text-[#808c3c]"
                        : "text-[#808c3c] ring-1 ring-[#808c3c] hover:bg-[#6e7a32] hover:text-white",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#808c3c]/70",
                    ].join(" ")
                  }
                  aria-label="AI Assistant"
                  title="AI Assistant"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden
                    className="opacity-90"
                  >
                    <path
                      d="M5 5l14 14M8 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zm10 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  AI Assistant
                </NavLink>
              </>
            )}

            {!user ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${linkBase} ${
                      isActive
                        ? linkActive
                        : "hover:text-gray-800 " + oliveTextHover
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    [
                      "inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold",
                      isActive
                        ? `${olive} ring-1 ring-[#808c3c]`
                        : "text-white " + oliveBg + " " + oliveBgHover,
                      "shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:text-white focus-visible:ring-[#808c3c]/70",
                    ].join(" ")
                  }
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              // Profile dropdown
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="group inline-flex items-center gap-2 rounded-full ps-1 pe-3 py-1.5 hover:bg-gray-100 hover:border-[#808c3c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#808c3c]/60"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                >
                  {user.profilePicture ? (
                    <img
                      src={publicUrl(user.profilePicture)}
                      alt={`${user.name} avatar`}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 grid place-items-center ring-1 ring-gray-200">
                      <svg
                        className="h-5 w-5 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 21a7 7 0 0114 0"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-semibold text-gray-800">
                    {user.name?.split(" ")[0] ?? "Profile"}
                  </span>
                  <svg
                    className="h-4 w-4 text-gray-500 group-hover:text-gray-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M5.25 7.5L10 12.25 14.75 7.5h-9.5z" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 overflow-hidden"
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/my-recipes"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#808c3c]"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Recipes
                      </Link>
                      <Link
                        to="/liked"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#808c3c]"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Liked Recipes
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#808c3c]  "
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 border-none bg-none"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#808c3c]/60"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="px-3 py-3 space-y-1">
            <NavLink
              to="/explore"
              className={mobileLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/liked"
                  className={mobileLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Liked
                </NavLink>
                <NavLink
                  to="/create-recipe"
                  className={mobileLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Recipe
                </NavLink>
                <NavLink
                  to="/ai"
                  className={mobileLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI Assistant
                </NavLink>
                <NavLink
                  to="/my-recipes"
                  className={mobileLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Recipes
                </NavLink>
                <div className="border-t border-gray-200 my-2" />
                <div className="flex items-center px-2 py-2 gap-3">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 grid place-items-center ring-1 ring-gray-200">
                      <svg
                        className="h-6 w-6 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 21a7 7 0 0114 0"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}
                  <div>
                    <div className="text-base font-semibold text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full block text-left px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:text-white hover:bg-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={mobileLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={mobileLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
