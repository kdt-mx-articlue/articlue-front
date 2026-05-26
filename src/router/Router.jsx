import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Resume from "../pages/Resume";
import Fitting from "../pages/Fitting";
import Growth from "../pages/Growth";
import Interview from "../pages/Interview";
import MyPage from "../pages/MyPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/fitting" element={<Fitting />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}