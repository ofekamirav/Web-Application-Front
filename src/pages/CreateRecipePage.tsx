import { useState, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiCreateRecipe } from "../api/recipeService";

type RecipeFormInputs = {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  location: string;
  image: FileList;
};

const brandOlive = "bg-[#808c3c]";
const brandOliveHover = "hover:bg-[#6e7a32]";
const brandOliveText = "text-[#808c3c]";

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RecipeFormInputs>();

  const { ref: imageRef, ...imageReg } = register("image", {
    required: "Image is required",
  });
  // Live preview for image
  const imageFile = watch("image");
  useEffect(() => {
    if (imageFile?.[0]) {
      setImagePreview(URL.createObjectURL(imageFile[0]));
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  // Drag & Drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      const dt = new DataTransfer();
      dt.items.add(f);
      setValue("image", dt.files, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setImagePreview(URL.createObjectURL(f));
      trigger("image");
    }
  };

  const onChooseFile = () => fileInputRef.current?.click();

  const onSubmit: SubmitHandler<RecipeFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);

    const ingredients = data.ingredients
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const file = fileInputRef.current?.files?.[0];

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
          <div
            className="rounded-3xl bg-cover bg-center ring-1 ring-gray-200 shadow-sm"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop')",
            }}
          >
            <div className="rounded-3xl backdrop-brightness-[.95] bg-white/50">
              <div className="px-6 py-10 md:py-16 md:px-12">
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1f2937] drop-shadow-sm">
                  Share Your Flavor
                </h1>
                <p className="mt-3 md:mt-4 max-w-2xl text-gray-700 text-base md:text-lg">
                  Upload your signature recipe, add a mouth-watering photo, and
                  inspire the RecipeHub community.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/80 ring-1 ring-gray-200">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${brandOlive}`}
                  ></span>
                  <span className="text-sm text-gray-700">
                    It takes ~2 minutes to publish
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Card */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tips / Summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick tips
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc ps-5">
                  <li>Use a clear, descriptive title.</li>
                  <li>Write one ingredient per line.</li>
                  <li>Break instructions into short steps.</li>
                  <li>Upload a bright, appetizing photo.</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Need inspiration?
                </h4>
                <p className="mt-2 text-sm text-gray-600">
                  Browse popular recipes on the{" "}
                  <Link
                    to="/explore"
                    className={`${brandOliveText} font-medium hover:underline`}
                  >
                    Explore
                  </Link>{" "}
                  page.
                </p>
              </div>
            </div>
          </aside>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-6 md:p-8"
            >
              {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("title", { required: "Title is required" })}
                    placeholder="e.g., Creamy Lemon Pasta"
                    className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-5">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Short Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description", {
                    required: "Description is required",
                  })}
                  rows={3}
                  placeholder="What makes this recipe special? Flavors, texture, serving ideas..."
                  className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Ingredients & Instructions - two columns */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor="ingredients"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ingredients (one per line)
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      Enter each item on a new line
                    </span>
                  </div>
                  <textarea
                    {...register("ingredients", {
                      required: "Ingredients are required",
                    })}
                    rows={8}
                    placeholder={
                      "2 tbsp olive oil\n1 onion, chopped\n2 garlic cloves, minced\n..."
                    }
                    className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3"
                  />
                  {errors.ingredients && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.ingredients.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="instructions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Instructions<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("instructions", {
                      required: "Instructions are required",
                    })}
                    rows={8}
                    placeholder={
                      "1) Heat oil in a pan...\n2) Add onion and sauté 3–4 min...\n3) Stir in garlic..."
                    }
                    className="w-full rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0 p-3"
                  />
                  {errors.instructions && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.instructions.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Uploader */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Image<span className="text-red-500">*</span>
                </label>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={onChooseFile}
                  className={[
                    "w-full rounded-2xl border-2 border-dashed p-6 transition cursor-pointer",
                    dragActive
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-300 hover:border-gray-400",
                  ].join(" ")}
                  role="button"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-xs rounded-xl object-cover aspect-[4/3]"
                      />
                    ) : (
                      <div className="w-full max-w-xs aspect-[4/3] rounded-xl bg-gray-100 grid place-items-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 16.5V6a3 3 0 013-3h12a3 3 0 013 3v10.5M3 16.5l4.5-4.5a2.121 2.121 0 013 0L15 16.5m-12 0h18M9 9h.01"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="sm:ms-2 text-center sm:text-left">
                      <p className="text-sm text-gray-700">
                        Drag & drop an image here, or{" "}
                        <span className={`${brandOliveText} font-semibold`}>
                          browse
                        </span>{" "}
                        your files
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
                      const f = e.target.files?.[0];
                      if (f) {
                        setImagePreview(URL.createObjectURL(f));
                        trigger("image");
                      }
                    }}
                  />
                </div>

                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 rounded-xl bg-red-50 text-red-700 text-sm p-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex justify-center items-center gap-2 ${brandOlive} ${brandOliveHover} text-white font-semibold py-3 px-6 rounded-2xl shadow-sm disabled:opacity-60`}
                >
                  {isLoading ? "Publishing..." : "Publish Recipe"}
                </button>
                <Link
                  to="/explore"
                  className="inline-flex justify-center items-center py-3 px-6 rounded-2xl font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 hover:text-[#1f2937]"
                >
                  Cancel
                </Link>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                By publishing, you confirm you own the rights to the photo and
                agree to our community guidelines.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateRecipePage;
