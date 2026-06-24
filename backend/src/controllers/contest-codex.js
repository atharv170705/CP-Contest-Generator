import axios from "axios";

const CODEFORCES_API = "https://codeforces.com/api";
const DIFFICULTY_OFFSETS = {
  easy: [-350, -250, -150, -50],
  balanced: [-200, -100, 0, 100, 200],
  hard: [-100, 0, 100, 200, 300],
};
const PROBLEM_COUNT_BY_DURATION = {
  90: 4,
  120: 5,
  180: 6,
};

const clampRating = (rating) => Math.max(800, Math.min(3500, Math.round(rating / 100) * 100));

const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)];

const matchesRequestedTags = (problem, tags) =>
  tags.length === 0 || problem.tags?.some((tag) => tags.includes(tag));

const toProblemDto = (problem) => ({
  contestId: problem.contestId,
  index: problem.index,
  name: problem.name,
  rating: problem.rating,
  tags: problem.tags ?? [],
  status: "pending",
  url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
});

function selectProblems(problems, solvedProblemKeys, tags, userRating, difficulty, duration) {
  const wantedCount = PROBLEM_COUNT_BY_DURATION[duration];
  const offsets = DIFFICULTY_OFFSETS[difficulty];
  const targetRatings = Array.from(
    { length: wantedCount },
    (_, index) => clampRating(userRating + offsets[Math.min(index, offsets.length - 1)]),
  );

  const candidates = problems.filter((problem) => {
    const key = `${problem.contestId}-${problem.index}`;
    return (
      problem.contestId &&
      problem.index &&
      problem.rating &&
      !solvedProblemKeys.has(key) &&
      matchesRequestedTags(problem, tags)
    );
  });

  const usedProblemKeys = new Set();
  const selectedProblems = [];

  for (const targetRating of targetRatings) {
    // Widen the window gradually so a less common tag still produces a contest.
    const pool = [100, 200, 300, 500]
      .map((window) => candidates.filter((problem) => {
        const key = `${problem.contestId}-${problem.index}`;
        return !usedProblemKeys.has(key) && Math.abs(problem.rating - targetRating) <= window;
      }))
      .find((matchingProblems) => matchingProblems.length > 0);

    if (!pool) continue;

    const problem = getRandomItem(pool);
    usedProblemKeys.add(`${problem.contestId}-${problem.index}`);
    selectedProblems.push(problem);
  }

  return selectedProblems;
}

const generateContest = async (req, res) => {
  const handle = typeof req.body.handle === "string" ? req.body.handle.trim() : "";
  const tags = Array.isArray(req.body.tags)
    ? [...new Set(req.body.tags.filter((tag) => typeof tag === "string" && tag.trim()).map((tag) => tag.trim()))]
    : [];
  const difficulty = String(req.body.difficulty ?? "balanced").toLowerCase();
  const duration = Number(req.body.duration ?? 120);

  if (!handle) {
    return res.status(400).json({ error: "A Codeforces handle is required." });
  }
  if (!DIFFICULTY_OFFSETS[difficulty]) {
    return res.status(400).json({ error: "Difficulty must be easy, balanced, or hard." });
  }
  if (!PROBLEM_COUNT_BY_DURATION[duration]) {
    return res.status(400).json({ error: "Duration must be 90, 120, or 180 minutes." });
  }

  try {
    const [userInfoResponse, submissionsResponse, problemsetResponse] = await Promise.all([
      axios.get(`${CODEFORCES_API}/user.info`, { params: { handles: handle } }),
      axios.get(`${CODEFORCES_API}/user.status`, { params: { handle } }),
      axios.get(`${CODEFORCES_API}/problemset.problems`),
    ]);

    if (
      userInfoResponse.data.status !== "OK" ||
      submissionsResponse.data.status !== "OK" ||
      problemsetResponse.data.status !== "OK"
    ) {
      return res.status(502).json({ error: "Codeforces could not provide the requested data. Please try again." });
    }

    const user = userInfoResponse.data.result[0];
    const submissions = submissionsResponse.data.result;
    const problems = problemsetResponse.data.result.problems;
    const solvedProblemKeys = new Set(
      submissions
        .filter((submission) => submission.verdict === "OK" && submission.problem?.contestId && submission.problem?.index)
        .map((submission) => `${submission.problem.contestId}-${submission.problem.index}`),
    );

    // New or unrated users get an approachable starting point.
    const userRating = user.rating ?? 1000;
    const selectedProblems = selectProblems(problems, solvedProblemKeys, tags, userRating, difficulty, duration);
    const expectedProblemCount = PROBLEM_COUNT_BY_DURATION[duration];

    if (selectedProblems.length < expectedProblemCount) {
      return res.status(404).json({
        error: "Not enough unsolved problems match these settings. Try fewer tags or a different difficulty.",
        found: selectedProblems.length,
        required: expectedProblemCount,
      });
    }

    return res.status(200).json({
      contest: {
        handle: user.handle,
        userRating,
        maxRating: user.maxRating ?? userRating,
        difficulty,
        duration,
        tags,
        generatedAt: new Date().toISOString(),
        problems: selectedProblems.map(toProblemDto),
      },
    });
  } catch (error) {
    const codeforcesMessage = error.response?.data?.comment;
    const status = error.response?.status === 400 ? 404 : 502;
    return res.status(status).json({
      error: codeforcesMessage || "Unable to generate a contest right now. Please try again.",
    });
  }
};

export { generateContest };