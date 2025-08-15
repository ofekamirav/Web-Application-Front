import { Link, useLocation } from "react-router-dom";
import type { Recipe } from "../api/recipeService";
import { publicUrl } from "../utils/publicUrl";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const location = useLocation();
  const img =
    recipe.imageUrl || "https://placehold.co/800x600/eee/777?text=Recipe+Image";
  const authorImg =
    recipe.author?.profilePicture ||
    "https://placehold.co/64x64/e0e0e0/757575?text=A";

  return (
    <Link
      to={`/recipe/${recipe._id}`}
      state={{ backgroundLocation: location }}
      aria-label={`Open recipe ${recipe.title}`}
      className="group block rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative">
        <img
          src={publicUrl(img)}
          alt={recipe.title}
          className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        {/* Likes badge */}
        <div className="absolute bottom-2 right-2 rounded-full px-2.5 py-1 text-xs font-semibold text-white bg-black/55 backdrop-blur-sm">
          ❤️ {recipe.likes?.length ?? 0}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-gray-800">
          {recipe.title}
        </h3>

        {/* optional subtitle/description snippet */}
        {recipe.description && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <img
            src={publicUrl(authorImg)}
            alt={recipe.author?.name ?? "Author"}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
            loading="lazy"
          />
          <p className="text-sm text-gray-700 truncate">
            {recipe.author?.name ?? "Unknown Chef"}
          </p>
        </div>

        {/* footer meta (אם יש) */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          {!!recipe.ingredients?.length && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white ring-1 ring-gray-200">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M8 7h13M8 12h13M8 17h13M3 7h.01M3 12h.01M3 17h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              {recipe.ingredients.length} ing.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
