import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  apiGetRecipeById,
  apiUpdateRecipe,
  apiUpdateRecipeImageFromFile,
} from "../api/recipeService";
import { useAuthStore } from "../store/authStore";
import { isAxiosError } from "axios";
import { publicUrl } from "../utils/publicUrl";

type EditForm = {
  title: string;
  description: string;
  ingredientsText: string;
  instructions: string;
};

const oliveBg = "bg-[#808c3c]";
const oliveBgHover = "hover:bg-[#6e7a32]";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (isAxiosError(err)) return err.response?.data?.message ?? err.message;
  if (err instanceof Error) return err.message;
  return fallback;
};

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({ mode: "onTouched" });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      setServerError(null);
      try {
        const recipe = await apiGetRecipeById(id);

        if (user && recipe.author?._id && recipe.author._id !== user._id) {
          setServerError("You can edit only your own recipes.");
        }

        setValue("title", recipe.title ?? "");
        setValue("description", recipe.description ?? "");
        setValue("instructions", recipe.instructions ?? "");
        setValue(
          "ingredientsText",
          Array.isArray(recipe.ingredients) ? recipe.ingredients.join("\n") : ""
        );
        setImageUrl(
          recipe.imageUrl ||
            "https://placehold.co/800x600/eee/777?text=Recipe+Image"
        );
      } catch (e: unknown) {
        console.error(e);
        setServerError(getErrorMessage(e, "Failed to load recipe for edit."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, setValue, user]);

  const onReplaceImage = async (file: File) => {
    if (!id) return;
    setImgUploading(true);
    setImgError(null);
    try {
      const updated = await apiUpdateRecipeImageFromFile(id, file);
      setImageUrl(updated.imageUrl);
    } catch (e: unknown) {
      console.error(e);
      setImgError(getErrorMessage(e, "Failed to update image."));
    } finally {
      setImgUploading(false);
    }
  };

  const onSubmit: SubmitHandler<EditForm> = async (data) => {
    if (!id) return;
    setServerError(null);

    const ingredients = data.ingredientsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      await apiUpdateRecipe(id, {
        title: data.title.trim(),
        description: data.description.trim(),
        instructions: data.instructions.trim(),
        ingredients,
      });
      navigate(`/recipe/${id}`);
    } catch (e: unknown) {
      console.error(e);
      setServerError(getErrorMessage(e, "Failed to update recipe."));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Edit recipe
          </h1>
          <p className="text-gray-600 mt-1">
            Update the content and save your changes.
          </p>
        </div>
        <Link
          to={id ? `/recipe/${id}` : "/my-recipes"}
          className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white ${oliveBg} ${oliveBgHover}`}
        >
          Back to recipe
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6 md:p-8"
          noValidate
        >
          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm p-3">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3"
                  placeholder="e.g., Creamy Lemon Pasta"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short description
                </label>
                <textarea
                  rows={3}
                  {...register("description", {
                    required: "Description is required",
                  })}
                  className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Ingredients + Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingredients (one per line)
                    </label>
                    <span className="text-xs text-gray-500">
                      One item per line
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    {...register("ingredientsText", {
                      required: "Ingredients are required",
                    })}
                    className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3"
                  />
                  {errors.ingredientsText && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.ingredientsText.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    rows={8}
                    {...register("instructions", {
                      required: "Instructions are required",
                    })}
                    className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3 whitespace-pre-wrap"
                  />
                  {errors.instructions && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.instructions.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center rounded-2xl px-5 py-2.5 text-sm font-semibold text-white ${oliveBg} ${oliveBgHover} disabled:opacity-60`}
                >
                  {isSubmitting ? "Saving…" : "Save changes"}
                </button>
                <Link
                  to={id ? `/recipe/${id}` : "/my-recipes"}
                  className="inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Image</h3>
                <img
                  src={
                    publicUrl(imageUrl) ||
                    "https://placehold.co/800x600/eee/777?text=Recipe+Image"
                  }
                  alt="Recipe"
                  className="w-full aspect-[4/3] object-cover rounded-xl ring-1 ring-gray-200"
                />
                <label className="block">
                  <span className="sr-only">Choose image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onReplaceImage(f);
                    }}
                    disabled={imgUploading}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3
                   file:rounded-xl file:border-0 file:text-sm file:font-semibold
                   file:bg-[#808c3c] file:text-white hover:file:bg-[#6e7a32]"
                  />
                </label>
                {imgUploading && (
                  <p className="text-xs text-gray-500">Uploading…</p>
                )}
                {imgError && (
                  <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                    {imgError}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </form>
      )}
    </div>
  );
}
