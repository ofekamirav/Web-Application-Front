import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExplorePage from "./pages/ExplorePage";
import { Navbar } from "./components/Navbar";
import RecipeDetailsPage from "./components/RecipeDetailsPage";
import CreateRecipePage from "./pages/CreateRecipePage";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./pages/SettingsPage";
import MyRecipesPage from "./pages/MyRecipesPage";
import AiRecipePage from "./pages/AiRecipePage";
import EditRecipePage from "./pages/EditRecipePage";
import LikedRecipesPage from "./pages/LikedRecipesPage";
import Footer from "./components/Footer";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

const AuthLayout = () => {
  return (
    <main className="w-full min-h-screen bg-gray-100">
      <Outlet />
    </main>
  );
};

function App() {
  const location = useLocation();
  const background = location.state && location.state.backgroundLocation;

  return (
    <>
      <Routes location={background || location}>
        {/* Auth routes - no navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main app routes - with navbar */}
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/recipe/:id" element={<RecipeDetailsPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create-recipe" element={<CreateRecipePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ai" element={<AiRecipePage />} />
            <Route path="/my-recipes" element={<MyRecipesPage />} />
            <Route path="/edit-recipe/:id" element={<EditRecipePage />} />
            <Route path="/liked" element={<LikedRecipesPage />} />
          </Route>
        </Route>
      </Routes>

      {/* Modal routes */}
      {background && (
        <Routes>
          <Route path="/recipe/:id" element={<RecipeDetailsPage />} />
        </Routes>
      )}
    </>
  );
}

const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default Root;
