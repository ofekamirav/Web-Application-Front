/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { apiSuggestRecipe, type AiSuggestion } from "../api/aiService";
import { apiCreateRecipe } from "../api/recipeService";
import { useAuthStore } from "../store/authStore";

type PublishForm = {
  title: string;
  description: string;
  instructions: string;
  ingredientsText: string; // one per line
  image: FileList;
};

const oliveBg = "bg-[#808c3c]";
const oliveBgHover = "hover:bg-[#6e7a32]";
const oliveText = "text-[#808c3c]";

export default function AiRecipePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [chips, setChips] = useState<string[]>([]);
  const [chipInput, setChipInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);

  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PublishForm>({
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      ingredientsText: "",
    },
    mode: "onTouched",
  });

  const { ref: imageRef, ...imageReg } = register("image");

  const canGenerate = useMemo(
    () => chips.filter((c) => c.trim()).length > 0,
    [chips]
  );

  const addChip = () => {
    const v = chipInput.trim();
    if (!v) return;
    if (!chips.includes(v)) setChips((p) => [...p, v]);
    setChipInput("");
  };
  const onChipKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip();
    }
  };
  const removeChip = (v: string) => setChips((p) => p.filter((x) => x !== v));

  const setPreviewFromFile = (file: File) => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setImgPreview(url);
  };

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setGenError(null);
    setSuggestion(null);
    try {
      const s = await apiSuggestRecipe(chips);
      setSuggestion(s);
      reset({
        title: s.title ?? "",
        description: s.description ?? "",
        instructions: Array.isArray(s.instructions)
          ? s.instructions.join("\n")
          : (s.instructions as unknown as string) ?? "",
        ingredientsText: chips.join("\n"),
      });
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
      setImgPreview(null);
    } catch (e: any) {
      console.error(e);
      setGenError(e?.response?.data?.message || "Failed to generate recipe.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;

    const dt = new DataTransfer();
    dt.items.add(f);
    setValue("image", dt.files, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setPreviewFromFile(f);
    trigger("image");
  };

  const onChooseImage = () => fileInputRef.current?.click();

  const clearImage = () => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setValue("image", undefined as unknown as FileList, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onPublish = handleSubmit(async (data) => {
    const ingredients = data.ingredientsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const file = data.image?.[0];

    try {
      const newRecipe = await apiCreateRecipe(
        {
          title: data.title.trim(),
          description: data.description.trim(),
          instructions: data.instructions.trim(),
          ingredients,
        },
        file
      );
      navigate(`/recipe/${newRecipe._id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to publish recipe.");
    }
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-8 text-center">
          <p className="text-gray-700">
            Please{" "}
            <Link to="/login" className={`${oliveText} font-semibold`}>
              log in
            </Link>{" "}
            to use AI and publish recipes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            AI Recipe Assistant
          </h1>
          <p className="text-gray-600 mt-1">
            Type ingredients — get a recipe — tweak — publish.
          </p>
        </div>
        <Link
          to="/my-recipes"
          className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-white hover:text-white ${oliveBg} ${oliveBgHover}`}
        >
          My Recipes
        </Link>
      </div>

      {/* Step 1: ingredients */}
      <section className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Your ingredients
        </h2>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-sm"
              >
                {c}
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => removeChip(c)}
                  aria-label={`Remove ${c}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={chipInput}
              onChange={(e) => setChipInput(e.target.value)}
              onKeyDown={onChipKey}
              placeholder="Type an ingredient and press Enter…"
              className="flex-1 rounded-2xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
            />
            <button
              onClick={addChip}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
            >
              Add
            </button>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${oliveBg} ${oliveBgHover} disabled:opacity-60`}
            >
              {isGenerating ? "Generating…" : "Generate recipe"}
            </button>
          </div>
          {genError && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {genError}
            </p>
          )}
        </div>
      </section>

      {/* Step 2: review & publish */}
      {suggestion && (
        <section className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Review & publish
            </h2>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              Regenerate
            </button>
          </div>

          <form onSubmit={onPublish} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  className="w-full rounded-2xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                  placeholder="e.g., Garlic Chicken and Broccoli Rice Bowl"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short description
                </label>
                <input
                  type="text"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  className="w-full rounded-2xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
                  placeholder="Up to ~20 words"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients (one per line)
                  </label>
                  <span className="text-xs text-gray-500">
                    Pulled from your list — edit as you like
                  </span>
                </div>
                <textarea
                  rows={8}
                  {...register("ingredientsText", {
                    required: "Ingredients are required",
                  })}
                  className="w-full rounded-2xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0"
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
                  className="w-full rounded-2xl border-gray-300 p-3 focus:border-gray-400 focus:ring-0 whitespace-pre-wrap"
                />
                {errors.instructions && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.instructions.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe image (optional)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDropImage}
                onClick={onChooseImage}
                className="w-full rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 p-4 cursor-pointer"
                role="button"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      imgPreview ??
                      "https://placehold.co/160x120/e0e0e0/757575?text=Preview"
                    }
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-xl ring-1 ring-gray-200"
                  />
                  <div>
                    <p className="text-sm text-gray-700">
                      Drag & drop or{" "}
                      <span className={`${oliveText} font-semibold`}>
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG/PNG, up to ~10MB.
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  {...imageReg}
                  ref={(el) => {
                    imageRef(el);
                    fileInputRef.current = el;
                  }}
                  className="hidden"
                  onChange={(e) => {
                    imageReg.onChange?.(e); // עדכן RHF
                    const f = (e.target as HTMLInputElement).files?.[0];
                    if (f) setPreviewFromFile(f);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-white ${oliveBg} ${oliveBgHover} disabled:opacity-60`}
              >
                {isSubmitting ? "Publishing…" : "Publish recipe"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuggestion(null);
                  clearImage();
                }}
                className="inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
              >
                Start over
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
