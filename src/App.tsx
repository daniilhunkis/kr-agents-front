import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import ExpressPage from "./pages/ExpressPage";
import ProfilePage from "./pages/ProfilePage";
import ShowsPage from "./pages/ShowsPage";
import AdminPage from "./pages/AdminPage";
import AddObject from "./pages/AddObject";
import MyObjectsPage from "./pages/MyObjectsPage";
import UsersPage from "./pages/UsersPage";
import Register from "./pages/Register";
import TelegramLogin from "./components/TelegramLogin";
import ModeratorPage from "./pages/ModeratorPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/express" element={<ExpressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/showings" element={<ShowsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/moderation" element={<ModeratorPage />} />
          <Route path="/add-object" element={<AddObject />} />
          <Route path="/my-objects" element={<MyObjectsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<TelegramLogin />} />
        </Route>
      </Routes>
    </Router>
  );
}
