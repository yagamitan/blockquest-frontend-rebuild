import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API;

export default function LessonList() {
  const { token } = useAuth();
  const [progress, setProgress] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        const response = await fetch(`${API}/lessons`);

        if (!response.ok) {
          throw new Error("Could not load lessons.");
        }

        const data = await response.json();
        setLessons(data);
      } catch (error) {
        setError(error.message);
      }
    }

    loadLessons();
  }, []);
  useEffect(() => {
    async function loadProgress() {
      if (!token) {
        setProgress([]);
        return;
      }
      try {
        const response = await fetch(`${API}/lessons/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Could not load learning progress.");
        }
        const data = await response.json();
        setProgress(data);
      } catch (error) {
        setError(error.message);
      }
    }
    loadProgress();
  }, [token]);

  return (
    <main className="lesson-page">
      <h1 className="page-title">BlockQuest</h1>
      <p className="page-subtitle">Choose a lesson to begin learning.</p>

      {error && <p role="alert">{error}</p>}

      <ul className="lesson-list">
        {lessons.map((lesson) => (
          <li className="lesson-card" key={lesson.id}>
            <h2>
              <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
            </h2>
            <p>{lesson.category}</p>
            <p>{lesson.summary}</p>
            {progress.some(
              (item) => item.lesson_id === lesson.id && item.completed,
            ) && <p>✅️ Completed</p>}
            {progress.some(
              (item) => item.lesson_id === lesson.id && !item.completed,
            ) && <p>🟡 In progress</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
