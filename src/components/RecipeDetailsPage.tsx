import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { apiGetRecipeById, apiLikeRecipe } from "../api/recipeService";
import type { Recipe } from "../api/recipeService";
import {
  apiGetCommentsByRecipeId,
  apiCreateComment,
  apiUpdateComment,
  apiDeleteComment,
} from "../api/commentService";
import type { Comment } from "../api/commentService";
import { useAuthStore } from "../store/authStore";
import { publicUrl } from "../utils/publicUrl";

const olive = "bg-[#808c3c]";
const oliveHover = "hover:bg-[#6e7a32]";
const oliveText = "text-[#808c3c]";

const RecipeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const isModal = !!location.state?.backgroundLocation;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [r, c] = await Promise.all([
          apiGetRecipeById(id),
          apiGetCommentsByRecipeId(id),
        ]);
        setRecipe(r);
        setComments(c);
      } catch (e) {
        console.error(e);
        setError("Failed to load recipe details.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (!recipe || !user) return;
    try {
      const updated = await apiLikeRecipe(recipe._id);
      setRecipe(updated);
    } catch (e) {
      console.error("Failed to toggle like:", e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe || !user || !newComment.trim()) return;
    try {
      const created = await apiCreateComment(newComment.trim(), recipe._id);

      const withAuthor: Comment = {
        ...created,
        author: created.author?._id
          ? created.author
          : {
              _id: user._id,
              name: user.name,
              profilePicture: user.profilePicture,
            },
      } as Comment;

      setComments((prev) => [withAuthor, ...prev]);
      setNewComment("");
    } catch (e) {
      console.error("Failed to post comment:", e);
    }
  };

  const startEdit = (c: Comment) => {
    setEditingId(c._id);
    setEditingText(c.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingText.trim()) return;
    try {
      const updated = await apiUpdateComment(editingId, editingText.trim());
      setComments((prev) =>
        prev.map((c) =>
          c._id === editingId ? { ...c, text: updated.text } : c
        )
      );
      cancelEdit();
    } catch (e) {
      console.error("Failed to update comment:", e);
    }
  };

  const deleteComment = async (id: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await apiDeleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      console.error("Failed to delete comment:", e);
    }
  };

  const handleClose = () => navigate(-1);

  const img =
    recipe?.imageUrl ||
    "https://placehold.co/1200x800/eee/777?text=Recipe+Image";
  const authorImg =
    recipe?.author?.profilePicture ||
    "https://placehold.co/64x64/e0e0e0/757575?text=A";

  const content = (
    <>
      {isLoading ? (
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-80 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        <div className="text-center p-10 text-red-600">{error}</div>
      ) : !recipe ? (
        <div className="text-center p-10">Recipe not found.</div>
      ) : (
        <>
          {/* Hero image */}
          <div className="relative">
            <img
              src={publicUrl(img)}
              alt={recipe.title}
              className="w-full max-h-[520px] object-cover rounded-2xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {/* Like button */}
            {user && (
              <button
                onClick={handleLike}
                className={`absolute top-4 right-4 inline-flex items-center justify-center rounded-full p-3 shadow-md
                  ${
                    recipe.likes.includes(user._id)
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-red-500 backdrop-blur"
                  }`}
                aria-label="Toggle like"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={
                    recipe.likes.includes(user._id) ? "currentColor" : "none"
                  }
                >
                  <path
                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Title + Author */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              {recipe.title}
            </h1>
            <div className="flex items-center gap-3">
              <img
                src={publicUrl(authorImg)}
                alt={recipe.author.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {recipe.author.name}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="mt-3 text-gray-700">{recipe.description}</p>
          )}

          {/* Body grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients – sticky card */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ingredients
                </h2>
                <ul className="mt-4 space-y-2 text-gray-700">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span
                        className={`mt-1 inline-block h-2 w-2 rounded-full ${olive}`}
                      />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Instructions */}
            <section className="lg:col-span-2">
              <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Instructions
                </h2>
                <ol className="mt-4 space-y-4 text-gray-700">
                  {recipe.instructions
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className={`shrink-0 grid place-items-center h-7 w-7 rounded-full text-white text-sm font-semibold ${olive}`}
                        >
                          {i + 1}
                        </span>
                        <p className="leading-relaxed">{step}</p>
                      </li>
                    ))}
                </ol>
              </div>

              {/* Comments */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  Comments ({comments.length})
                </h3>
                {user ? (
                  <form
                    onSubmit={handleCommentSubmit}
                    className="mt-3 flex gap-3"
                  >
                    <img
                      src={
                        publicUrl(user.profilePicture) ||
                        "https://placehold.co/40x40"
                      }
                      alt="You"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts…"
                        className="w-full rounded-xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                        rows={2}
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          className={`inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white ${olive} ${oliveHover}`}
                        >
                          Add Comment
                        </button>
                        <span className="text-xs text-gray-500">
                          Be kind & constructive ✨
                        </span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">
                    <Link
                      to="/login"
                      className={oliveText + " font-semibold hover:underline"}
                    >
                      Log in
                    </Link>{" "}
                    to comment.
                  </p>
                )}

                <div className="mt-6 space-y-4">
                  {comments.map((c) => {
                    const isOwner = user?._id === c.author._id;
                    const avatar =
                      publicUrl(c.author.profilePicture) ||
                      "https://placehold.co/40x40";

                    return (
                      <div key={c._id} className="flex items-start gap-3">
                        <img
                          src={avatar}
                          alt={c.author.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                        />
                        <div className="flex-1 rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {c.author.name}
                            </p>

                            {isOwner && (
                              <div className="flex items-center gap-2">
                                {editingId === c._id ? (
                                  <>
                                    <button
                                      onClick={saveEdit}
                                      className="text-xs font-semibold text-white px-2 py-1 rounded-md bg-[#808c3c]"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="text-xs font-semibold text-gray-700 px-2 py-1 rounded-md ring-1 ring-gray-300 hover:bg-gray-100"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEdit(c)}
                                      className="text-xs font-semibold text-gray-700 px-2 py-1 rounded-md ring-1 ring-gray-300 hover:bg-gray-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteComment(c._id)}
                                      className="text-xs font-semibold text-red-600 px-2 py-1 rounded-md hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {editingId === c._id ? (
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="mt-2 w-full rounded-xl border-gray-300 p-2 focus:border-gray-400 focus:ring-0"
                              rows={2}
                            />
                          ) : (
                            <p className="text-gray-700 mt-1">{c.text}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={handleClose}
      >
        <div
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="p-4 md:p-8">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {content}
    </div>
  );
};

export default RecipeDetailsPage;
