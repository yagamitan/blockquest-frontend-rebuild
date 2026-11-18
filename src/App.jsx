import { Route, Routes } from "react-router";
import Layout from "./layout/Layout";
import Login from "./auth/Login";
import Register from "./auth/Register";
import LessonList from "./lessons/LessonList";
import LessonDetail from "./lessons/LessonDetail";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LessonList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lessons/:id" element={<LessonDetail />} />
      </Route>
    </Routes>
  );
}
