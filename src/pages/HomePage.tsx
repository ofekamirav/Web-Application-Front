import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetRecipes, type Recipe } from "../api/recipeService";
import { RecipeCard } from "../components/RecipeCard";
import { useAuthStore } from "../store/authStore";

const olive = "bg-[#808c3c]";
const oliveHover = "hover:bg-[#6e7a32]";

const HomePage = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiGetRecipes({ limit: 4 });
        setFeaturedRecipes(response.data);
      } catch (error) {
        console.error("Failed to fetch featured recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="relative h-[60vh] min-h-[420px] bg-cover bg-center"
          style={{ backgroundImage: "url('/home-pic.jpeg')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Glass bar */}
          <div className="absolute inset-x-0 top-6 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-white/70 backdrop-blur-md ring-1 ring-white/60 shadow-sm px-4 py-3 w-fit">
              <span className="text-sm text-gray-700">
                Join thousands of home cooks
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div>
              <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-md">
                Find, Share & Cook
              </h1>
              <p className="mt-4 mx-auto max-w-2xl text-white/95 text-lg md:text-xl drop-shadow">
                Discover new flavors every day and inspire the RecipeHub
                community.
              </p>

              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  to="/explore"
                  className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 hover:text-white text-white font-semibold shadow-sm ${olive} ${oliveHover}`}
                >
                  Explore Recipes
                </Link>

                {user ? (
                  <Link
                    to="/create-recipe"
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold hover:text-gray-700 text-gray-900 bg-white/90 hover:bg-white shadow-sm"
                  >
                    Create Recipe
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-gray-900 bg-white/90 hover:bg-white shadow-sm"
                  >
                    Join Free
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative curve */}
        <svg
          className="block w-full -mt-1"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,32L1440,0L1440,48L0,48Z" fill="#ffffff"></path>
        </svg>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              title: "Share Your Recipes",
              text: "Easily upload your winning recipes and share them with a vibrant community.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              ),
            },
            {
              title: "Discover New Flavors",
              text: "Explore thousands of recipes, filter by ingredients, and find your next meal.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              ),
            },
            {
              title: "Smart AI Assistant",
              text: "Tell us what’s in your fridge and get creative suggestions instantly.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              ),
            },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6 text-center"
            >
              <div
                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-white shadow-sm"
                style={{ backgroundColor: "#9ca13f" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {f.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Featured Recipes</h2>
          <Link
            to="/explore"
            className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm font-semibold hover:text-white text-white ${olive} ${oliveHover}`}
          >
            Explore all
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm"
              >
                <div className="aspect-[4/3] rounded-t-2xl bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredRecipes.length === 0 ? (
          <p className="text-center text-gray-500">
            No featured recipes available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* CTA bottom */}
        <div className="mt-10 text-center">
          <Link
            to={user ? "/create-recipe" : "/register"}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 hover:text-white text-white font-semibold shadow-sm ${olive} ${oliveHover}`}
          >
            {user ? "Publish a new recipe" : "Join and start cooking"}
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            It takes ~2 minutes to publish.
          </p>
        </div>
      </section>

      {/* Footer promo */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-200 shadow-sm p-6 md:p-10 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Cook together. Learn together.
          </h3>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Save favorites, follow creators, and let our AI suggest recipes from
            your pantry.
          </p>
          <div className="mt-6">
            <Link
              to="/explore"
              className={`inline-flex rounded-2xl px-6 py-3 text-sm font-semibold hover:text-white text-white ${olive} ${oliveHover}`}
            >
              Start exploring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
