import { Link } from "react-router-dom";

const olive = "text-[#808c3c]";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Brand + about */}
          <div>
            <Link
              to="/"
              className={`text-2xl font-extrabold ${olive} hover:opacity-90 tracking-tight hover:text-[#6e7a32]`}
              aria-label="RecipeHub Home"
            >
              RecipeHub
            </Link>
            <p className="mt-3 text-sm text-gray-600 leading-6">
              Discover, share, and cook together with the community. Real
              recipes from real kitchens — every day a new flavor.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500 text-center">
            © {year} RecipeHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
