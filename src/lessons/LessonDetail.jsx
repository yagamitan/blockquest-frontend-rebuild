import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useParams } from "react-router";

const API = import.meta.env.VITE_API;

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const { token } = useAuth();
  const [quizResult, setQuizResult] = useState(null);
  const [quizError, setQuizError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      try {
        const response = await fetch(`${API}/lessons/${id}`);

        if (!response.ok) {
          throw new Error("Could not load this lesson.");
        }

        const data = await response.json();
        setLesson(data);
      } catch (error) {
        setError(error.message);
      }
    }

    loadLesson();
  }, [id]);

  async function handleSubmit() {
    setQuizError("");
    setQuizResult(null);

    if (lesson.questions.some((question) => !selectedOptions[question.id])) {
      setQuizError("Please answer every question first.");
      return;
    }
    try {
      const response = await fetch(`${API}/lessons/${id}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: lesson.questions.map((question) => ({
            questionId: question.id,
            selectedOption: selectedOptions[question.id],
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      const result = await response.json();
      setQuizResult(result);
    } catch (error) {
      setQuizError(error.message);
    }
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!lesson) {
    return <p>Loading lesson...</p>;
  }

  return (
    <main>
      <p>{lesson.category}</p>
      <h1>{lesson.title}</h1>
      <p>{lesson.summary}</p>
      <p>{lesson.content}</p>

      {lesson.questions?.length > 0 && (
        <section>
          <h2>Quick check</h2>
          {lesson.questions.map((question) => (
            <fieldset key={question.id}>
              <legend>{question.prompt}</legend>

              {[
                ["A", question.option_a],
                ["B", question.option_b],
                ["C", question.option_c],
              ].map(([option, text]) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={selectedOptions[question.id] === option}
                    onChange={(event) =>
                      setSelectedOptions({
                        ...selectedOptions,
                        [question.id]: event.target.value,
                      })
                    }
                  />
                  {text}
                </label>
              ))}
            </fieldset>
          ))}
          <button type="button" onClick={handleSubmit}>
            Check answers
          </button>

          {quizError && <p role="alert">{quizError}</p>}

          {quizResult && (
            <div>
              <p>
                Your score: {quizResult.score} / {quizResult.total}
              </p>

              {quizResult.results.map((result, index) => (
                <p key={result.questionId}>
                  Question {index + 1}:{" "}
                  {result.correct ? "Correct" : "Not quite"} —{" "}
                  {result.explanation}
                </p>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
