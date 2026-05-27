import { createBrowserRouter } from "react-router-dom";

import Onboarding from "../pages/Onboarding.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import Resume from "../pages/Resume.jsx";
import Fitting from "../pages/Fitting.jsx";
import Growth from "../pages/Growth.jsx";
import Interview from "../pages/Interview.jsx";
import MyPage from "../pages/MyPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Onboarding />,
  },
  {
    path: "/home",
    element: <Home />,
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
    element: <Resume />,
  },
  {
    path: "/fitting",
    element: <Fitting />,
  },
  {
    path: "/growth",
    element: <Growth />,
  },
  {
    path: "/interview",
    element: <Interview />,
  },
  {
    path: "/mypage",
    element: <MyPage />,
  },
]);

export default router;