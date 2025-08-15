import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  apiGetMyRecipes,
  apiDeleteRecipe,
  type Recipe,
} from "../api/recipeService";
import { publicUrl } from "../utils/publicUrl";

const PAGE_SIZE = 8;

const oliveBg = "bg-[#808c3c]";
const oliveBgHover = "hover:bg-[#6e7a32]";
const oliveText = "text-[#808c3c]";

export default function MyRecipesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"new" | "likes">("new");

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiGetMyRecipes({ page: 1, limit: PAGE_SIZE });
        if (!cancelled) {
          setRecipes(res.data);
          setTotalPages(res.totalPages ?? 1);
          setPage(1);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError("Failed to load your recipes.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?._id]);

  const loadMore = async () => {
    if (page >= totalPages || !user?._id) return;
    setIsLoadingMore(true);
    try {
      const next = page + 1;
      const res = await apiGetMyRecipes({ page: next, limit: PAGE_SIZE });
      setRecipes((prev) => [...prev, ...res.data]);
      setPage(next);
      setTotalPages(res.totalPages ?? next);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = recipes;

    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "likes") {
      list = [...list].sort(
        (a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0)
      );
    } else {
      list = [...list].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }
    return list;
  }, [recipes, search, sortBy]);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await apiDeleteRecipe(pendingDeleteId);
      setRecipes((prev) => prev.filter((r) => r._id !== pendingDeleteId));
      setPendingDeleteId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to delete recipe.");
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
            to view your recipes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            My Recipes
          </h1>
          <p className="text-gray-600 mt-1">
            Manage, edit and share your creations.
          </p>
        </div>
        <Link
          to="/create-recipe"
          className={`inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white hover:text-white ${oliveBg} ${oliveBgHover}`}
        >
          + Create new
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in your recipes…"
            className="w-full rounded-2xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "new" | "likes")}
            className="rounded-2xl border-gray-300 p-2.5 focus:border-gray-400 focus:ring-0"
          >
            <option value="new">Newest</option>
            <option value="likes">Most liked</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
      ) : filteredSorted.length === 0 ? (
        <div className="rounded-3xl bg-white ring-1 ring-gray-200 p-10 text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            No recipes yet
          </h3>
          <p className="mt-2 text-gray-600">
            Start by creating your first recipe.
          </p>
          <Link
            to="/create-recipe"
            className={`mt-4 inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-white hover:text-white ${oliveBg} ${oliveBgHover}`}
          >
            Create recipe
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSorted.map((r) => (
              <article
                key={r._id}
                className="group rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="relative">
                  <img
                    src={
                      publicUrl(r.imageUrl) ||
                      "https://placehold.co/800x600/eee/777?text=Recipe+Image"
                    }
                    alt={r.title}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold text-white bg-black/55 backdrop-blur-sm">
                    ❤️ {r.likes?.length ?? 0}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1">
                    {r.title}
                  </h3>
                  {r.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {r.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : ""}
                    </p>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/recipe/${r._id}`}
                        state={{ backgroundLocation: location }}
                        className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                      >
                        View
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link
                        to={`/edit-recipe/${r._id}`}
                        className={`${oliveText} text-sm font-semibold hover:underline`}
                      >
                        Edit
                      </Link>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => setPendingDeleteId(r._id)}
                        className="text-sm font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {page < totalPages && (
            <div className="pt-4 text-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className={`inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-white ${oliveBg} ${oliveBgHover} disabled:opacity-60`}
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirm modal */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white ring-1 ring-gray-200 shadow-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900">
              Delete recipe?
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              This action cannot be undone. The recipe will be permanently
              removed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
