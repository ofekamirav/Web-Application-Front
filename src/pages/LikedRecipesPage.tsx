import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetLikedRecipes, type Recipe } from "../api/recipeService";
import { RecipeCard } from "../components/RecipeCard";
import { useAuthStore } from "../store/authStore";

const oliveBg = "bg-[#808c3c]";
const oliveBgHover = "hover:bg-[#6e7a32]";
const oliveText = "text-[#808c3c]";

export default function LikedRecipesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiGetLikedRecipes({ page: 1, limit: 24 });
        if (!cancelled) setRecipes(res.data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to load liked recipes.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-8 text-center">
          <p className="text-gray-700">
            Please{" "}
            <Link className={`${oliveText} font-semibold`} to="/login">
              log in
            </Link>{" "}
            to view your liked recipes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Liked Recipes
          </h1>
          <p className="text-gray-600 mt-1">
            All the dishes you’ve given a ❤️.
          </p>
        </div>
        <Link
          to="/explore"
          className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white hover:text-white ${oliveBg} ${oliveBgHover}`}
        >
          Explore more
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : error ? (
        <div className="rounded-2xl bg-red-50 ring-1 ring-red-200 p-6 text-red-700">
          {error}
        </div>
      ) : recipes.length === 0 ? (
        <div className="rounded-3xl bg-white ring-1 ring-gray-200 p-10 text-center">
          <h3 className="text-xl font-semibold text-gray-900">No likes yet</h3>
          <p className="mt-2 text-gray-600">Go find something tasty to ❤️.</p>
          <Link
            to="/explore"
            className={`mt-4 inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-white ${oliveBg} ${oliveBgHover}`}
          >
            Browse recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map((r) => (
            <RecipeCard key={r._id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}
