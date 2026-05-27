import { RouterProvider } from "react-router-dom";
import router from "./router/Router.jsx";

export default function App() {
  return <RouterProvider router={router} />;
}