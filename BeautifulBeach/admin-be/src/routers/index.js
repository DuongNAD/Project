import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Mainlayout from "../layouts/Mainlayout";
import Login from "../page/admin/login";
import Home from "../page/home/home";
import Region from "../page/admin/region";
import Beaches from "../page/admin/beaches";
import HomeMainLayout from "../layouts/HomeMainLayout";
import LoginAccout from "../page/account/loginAccout";
import HomeAccount from "../page/account/home";
import ForgotPasswordForm from "../page/account/ForgotPasswordForm";
import Otp from "../page/account/Otp";
import ResetPassword from "../page/account/ResetPassword";
import Register from "../page/account/Register";
import Accout from "../page/admin/accout";
import HomeLayout from "../layouts/HomeLayout";
import HomeAdmin from "../page/admin/HomeAdmin";
import ImageBanner from "../page/admin/ImageBanner";
import DetailBeaches from "../page/home/detail";
import Comment from "../page/admin/Comment";
import RegionBeaches from "../page/home/region/Region";
import SeachBeaches from "../page/home/seachBeache/SeachBeaches";
import Favorites from "../page/home/favorites/Favorites";
import Profile from "../page/account/Profile";

const auth = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token !== null && role === "1";
};
const authAccount = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token !== null && role === "2";
};
const PrivateRoute = ({ children }) => {
  return auth() ? children : <Navigate to="/login" replace />;
};
const PrivateAccountRoute = ({ children }) => {
  return authAccount() ? children : <Navigate to="/login-account" replace />;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Mainlayout>
                <HomeAdmin />
              </Mainlayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/favorite"
          element={
            <PrivateAccountRoute>
              <HomeLayout>
                <Favorites />
              </HomeLayout>
            </PrivateAccountRoute>
          }
        />
        <Route
          path="/admin/region"
          element={
            <PrivateRoute>
              <Mainlayout>
                <Region />
              </Mainlayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/beaches"
          element={
            <PrivateRoute>
              <Mainlayout>
                <Beaches />
              </Mainlayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/banner"
          element={
            <PrivateRoute>
              <Mainlayout>
                <ImageBanner />
              </Mainlayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/account"
          element={
            <PrivateRoute>
              <Mainlayout>
                <Accout />
              </Mainlayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/comment"
          element={
            <PrivateRoute>
              <Mainlayout>
                <Comment />
              </Mainlayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/login-account"
          element={
            <HomeMainLayout>
              <LoginAccout />
            </HomeMainLayout>
          }
        />
        <Route
          path="/account/home"
          element={
            <PrivateAccountRoute>
              <HomeMainLayout>
                <HomeAccount />
              </HomeMainLayout>
            </PrivateAccountRoute>
          }
        />
        <Route
          path="/forgot-passs"
          element={
            <HomeMainLayout>
              <ForgotPasswordForm />
            </HomeMainLayout>
          }
        />
        <Route
          path="/otp"
          element={
            <HomeMainLayout>
              <Otp />
            </HomeMainLayout>
          }
        />
        <Route
          path="/reset-pass"
          element={
            <HomeMainLayout>
              <ResetPassword />
            </HomeMainLayout>
          }
        />
        <Route
          path="/register-account"
          element={
            <HomeMainLayout>
              <Register />
            </HomeMainLayout>
          }
        />
        <Route
          path="/"
          element={
            <HomeLayout>
              <Home />
            </HomeLayout>
          }
        />
        <Route
          path="/detail-beaches/:id"
          element={
            <HomeLayout>
              <DetailBeaches />
            </HomeLayout>
          }
        />
        <Route
          path="/region/:id"
          element={
            <HomeLayout>
              <RegionBeaches />
            </HomeLayout>
          }
        />
        <Route
          path="/seach-beaches/:keyword"
          element={
            <HomeLayout>
              <SeachBeaches />
            </HomeLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateAccountRoute>
              <HomeLayout>
                <Profile />
              </HomeLayout>
            </PrivateAccountRoute>
          }
        />
        <Route
          path="*"
          element={
            <HomeLayout>
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold mb-4">
                  404 - Page Not Found
                </h1>
                <p className="text-gray-600">
                  The page you are looking for does not exist.
                </p>
              </div>{" "}
            </HomeLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
