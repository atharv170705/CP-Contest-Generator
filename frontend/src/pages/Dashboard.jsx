import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const topics = [
  "2-sat",
  "binary search",
  "bitmasks",
  "brute force",
  "chinese remainder theorem",
  "combinatorics",
  "constructive algorithms",
  "data structures",
  "dfs and similar",
  "divide and conquer",
  "dp",
  "dsu",
  "expression parsing",
  "fft",
  "flows",
  "games",
  "geometry",
  "graph matchings",
  "graphs",
  "greedy",
  "hashing",
  "implementation",
  "interactive",
  "math",
  "matrices",
  "meet-in-the-middle",
  "number theory",
  "probabilities",
  "schedules",
  "shortest paths",
  "sortings",
  "string suffix structures",
  "strings",
  "ternary search",
  "trees",
  "two pointers",
];

export default function Home() {
  const [handle, setHandle] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState("balanced");
  const [duration, setDuration] = useState("120");

  const navigate = useNavigate();

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((item) => item !== topic)
        : [...prev, topic],
    );
  };

  const generateContest = async (e) => {
    e.preventDefault();

    const payload = {
      handle,
      tags: selectedTopics,
      difficulty,
      duration,
    };

    // const response = await axios.post('http://localhost:8000/generate-contest', payload);
    const response = await axios.post('http://localhost:8000/generate-test-contest', payload);
    
    const contestId = response.data.contestId;
    navigate(`/contest/${contestId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-blue-600">
          Contest Generator
        </h1>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900">
            Build your contest
          </h2>

          <p className="mt-2 text-lg text-gray-500">
            Practice with personalized Codeforces contests.
          </p>

          <form onSubmit={generateContest} className="mt-8">
            {/* Handle */}
            <div>
              <label className="mb-3 block text-lg font-semibold text-gray-800">
                Codeforces Handle
              </label>

              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. tourist"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-300
                  bg-white
                  px-6
                  py-4
                  text-lg
                  text-gray-800
                  placeholder:text-gray-400
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-100
                "
              />
            </div>

            {/* Topics */}
            <div className="mt-8">
              <label className="block text-lg font-semibold text-gray-800">
                Focus Topics
                <span className="ml-2 text-base font-normal text-gray-500">
                  (optional)
                </span>
              </label>

              <select
                className="
                mt-4
                w-full
                rounded-2xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-base
                text-gray-700
                outline-none
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              "
                defaultValue=""
                onChange={(e) => {
                  const value = e.target.value;

                  if (value && !selectedTopics.includes(value)) {
                    setSelectedTopics((prev) => [...prev, value]);
                  }

                  e.target.value = "";
                }}
              >
                <option value="">Select Topic</option>

                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedTopics.map((topic) => (
                  <div
                    key={topic}
                    className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-blue-100
                    px-3
                    py-1.5
                    text-sm
                    text-blue-700
                  "
                  >
                    {topic}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTopics((prev) =>
                          prev.filter((t) => t !== topic),
                        )
                      }
                      className="font-bold"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty + Duration */}
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-lg font-semibold text-gray-800">
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-300
                    bg-white
                    px-6
                    py-4
                    text-lg
                    text-gray-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                  "
                >
                  <option value="easy">Easy</option>
                  <option value="balanced">Balanced</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-lg font-semibold text-gray-800">
                  Duration
                </label>

                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-300
                    bg-white
                    px-6
                    py-4
                    text-lg
                    text-gray-700
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                  "
                >
                  <option value="90">90 Minutes</option>
                  <option value="120">2 Hours</option>
                  <option value="180">3 Hours</option>
                </select>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="
                mt-10
                w-full
                rounded-2xl
                bg-blue-600
                py-4
                text-lg
                font-semibold
                text-white
                transition
                hover:bg-blue-700
              "
            >
              Generate Contest
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
