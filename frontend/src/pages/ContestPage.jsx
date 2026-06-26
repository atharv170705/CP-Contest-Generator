import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from 'axios';

export default function ContestPage() {
  const {contestId} = useParams();

  const [problems, setProblems] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  const getContest = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/contest/${contestId}`);

      const formattedProblems = response.data.problems.map((item) => ({
        contestId: item.contest_id_cf,
        index: item.problem_index,
        name: item.problem_name,
        rating: item.rating,
        status: item.status
      }));

      setProblems(formattedProblems);  
  
      const createdAt = new Date(response.data.createdAt);
      const durationSeconds = response.data.duration * 60;
      const elapsedSeconds = Math.floor((Date.now() - createdAt) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsedSeconds);

      setTimeLeft(remaining);

      setIsEnded(response.data.isEnded);

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getContest();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timer);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatus = (status) => {
    switch(status){
      case "solved":
        return (
          <span className="text-green-600 font-bold">
            ✓ Solved
          </span>
        );

      case "wrong":
        return (
          <span className="text-red-600 font-bold">
            ✗ Wrong
          </span>
        );

      default:
        return (
          <span className="text-yellow-600">
            ⏳ Pending
          </span>
        );
    }
  };

  const checkProgress = async () => {
      await getContest();
  }

  const endContest = async () => {
    try {
      const response = await axios.patch(`http://localhost:8000/contest/${contestId}/end`);
      console.log(response.data.message);
      await getContest();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Generated Contest</h1>

            <p className="mt-1 text-gray-500">
              Codeforces-style practice session
            </p>
          </div>

          <div className="rounded-lg border bg-white px-6 py-3 shadow-sm">
            <p className="text-sm text-gray-500">Time Remaining</p>

            <p className="text-2xl font-bold text-red-600">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {/* Contest Table */}

        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-3 text-left">#</th>

                <th className="border px-4 py-3 text-left">Name</th>

                <th className="border px-4 py-3 text-left">Rating</th>

                <th className="border px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
 
            <tbody>
              {problems.map((problem) => (
                <tr key={`${problem.contestId}-${problem.index}`}>
                  <td className="border px-4 py-3 font-semibold">
                    {problem.index}
                  </td>

                  <td className="border px-4 py-3">
                    {isEnded ? (
                        <span className="text-gray-500 cursor-not-allowed">
                            {problem.name}
                        </span>
                    ) : (
                        <a
                            href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {problem.name}
                        </a>
                    )}
                  </td>

                  <td className="border px-4 py-3">{problem.rating}</td>

                  <td className="border px-4 py-3 text-lg">
                    {getStatus(problem.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}

        <div className="mt-6 flex gap-4">
          <button
            disabled={isEnded}
            className={`
                rounded-lg
                px-5
                py-2
                font-medium
                text-white
                ${isEnded
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"}
            `}
            onClick={checkProgress}
        >
            Check Progress
        </button>

          <button
            className="
              rounded-lg
              border
              bg-white
              px-5
              py-2
              font-medium
              hover:bg-gray-50
            "
            disabled={isEnded}
            onClick={endContest}
          >
            End Contest
          </button>
        </div>
      </div>
    </div>
  );
}
