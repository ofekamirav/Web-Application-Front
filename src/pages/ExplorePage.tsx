import { useEffect, useState } from "react";
import { apiGetRecipes, type Recipe } from "../api/recipeService";
import { RecipeCard } from "../components/RecipeCard";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

const ExplorePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);

      const q = searchTerm.trim();
      const params = q ? { title: q } : undefined;

      try {
        const response = await apiGetRecipes(params);
        setRecipes(response.data);
      } catch {
        setError("Failed to fetch recipes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const id = setTimeout(fetchRecipes, 500);
    return () => clearTimeout(id);
  }, [searchTerm]);

  return (
    <div className="space-y-8">
      {/* Hero Section & Search */}
      <div className="text-center p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-[#9ca13f] mb-2">
          Discover Delicious Recipes
        </h1>
        <p className="text-gray-600 mb-6">
          Find your next favorite meal from our community's collection.
        </p>
        <div className="max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search for recipes by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9ca13f] transition-all"
          />
        </div>
      </div>

      {/* Recipes Grid */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Lottie
              animationData={loadingAnimation}
              loop
              style={{ height: 200 }}
            />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No recipes found. Why not be the first to create one?
          </p>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
