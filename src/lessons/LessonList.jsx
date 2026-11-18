import { Link } from "react-router";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API;

export default function LessonList() {
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

  return (
    <main>
      <h1>BlockQuest</h1>
      <p>Choose a lesson to begin learning.</p>

      {error && <p role="alert">{error}</p>}

      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <h2>
              <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
            </h2>
            <p>{lesson.category}</p>
            <p>{lesson.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
