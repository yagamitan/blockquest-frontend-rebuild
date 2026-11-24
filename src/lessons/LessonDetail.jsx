import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useParams } from "react-router";

const API = import.meta.env.VITE_API;

function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

function renderLessonContent(content) {
  return content.split(/\n\n+/).map((block, index) => {
    const [firstLine, ...remainingLines] = block.split("\n");
    const heading = firstLine.startsWith("## ") ? firstLine.slice(3) : null;
    const paragraph = heading
      ? remainingLines.join(" ")
      : block.replace(/\n/g, " ");

    return (
      <section key={index}>
        {heading && <h2>{heading}</h2>}
        {paragraph && <p>{renderInlineMarkdown(paragraph)}</p>}
      </section>
    );
  });
}

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
    <main className="lesson-detail-page">
      <p>
        <Link className="back-to-lessons" to="/">
          Back to lessons
        </Link>
      </p>
      <p>{lesson.category}</p>
      <h1>{lesson.title}</h1>
      <p>{lesson.summary}</p>
      <div className="lesson-content">
        {renderLessonContent(lesson.content)}
      </div>

      {lesson.questions?.length > 0 && (
        <section className="quick-check">
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
            <div className="quiz-results">
              <p>
                Your score: {quizResult.score} / {quizResult.total}
              </p>

              {quizResult.results.map((result, index) => (
                <p
                  key={result.questionId}
                  className={
                    result.correct ? "answer-correct" : "answer-incorrect"
                  }
                >
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
