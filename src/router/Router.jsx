import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute.jsx";

import Onboarding from "../pages/Onboarding.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import Resume from "../pages/Resume.jsx";
import Fitting from "../pages/Fitting.jsx";
import Growth from "../pages/Growth.jsx";
import Loading from "../pages/Loading.jsx";
import Interview from "../pages/Interview.jsx";
import MyPage from "../pages/MyPage.jsx";
import KakaoCallback from "../pages/KakaoCallback.jsx";
import NaverCallback from "../pages/NaverCallback.jsx";
import GithubCallback from "../pages/GithubCallback.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Onboarding />,
  },

  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/signup",
    element: <Signup />,
  },

  {
    path: "/resume",
    element: (
      <ProtectedRoute>
        <Resume />
      </ProtectedRoute>
    ),
  },

  {
    path: "/fitting",
    element: (
      <ProtectedRoute>
        <Fitting />
      </ProtectedRoute>
    ),
  },

  {
    path: "/growth",
    element: (
      <ProtectedRoute>
        <Growth />
      </ProtectedRoute>
    ),
  },

  {
    path: "/loading",
    element: (
      <ProtectedRoute>
        <Loading />
      </ProtectedRoute>
    ),
  },

  {
    path: "/interview",
    element: (
      <ProtectedRoute>
        <Interview />
      </ProtectedRoute>
    ),
  },

  {
    path: "/mypage",
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/auth/kakao/callback",
    element: <KakaoCallback />,
  },

  {
    path: "/auth/naver/callback",
    element: <NaverCallback />,
  },

  {
    path: "/auth/github/callback",
    element: <GithubCallback />,
  },
]);

export default router;