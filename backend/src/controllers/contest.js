import axios from "axios";
import { createUser, getUserByHandle, getUserById } from "../model/user.model.js";
import { createContest, endContestById, getContestById } from "../model/contest.model.js";
import { createContestProblems, getContestProblemsById } from "../model/contestProblems.model.js";

const generateContest = async (req, res) => {
  const { handle, tags = [], difficulty, duration } = req.body;

  if (!handle) {
    return res.status(400).json({
      error: "Handle is required",
    });
  }

  try {
  
    const userRes = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    const problemsRes = await axios.get("https://codeforces.com/api/problemset.problems");

    const user = userRes.data.result[0];
    const submissions = statusRes.data.result;
    const problems = problemsRes.data.result.problems;

    let dbUser = await getUserByHandle(handle);
    if(!dbUser) {
      dbUser = await createUser({
        handle,
        rating: user.rating
      })
    }

    const solved = new Set();

    for (const sub of submissions) {
      if (sub.verdict === "OK") {
        solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    }

    let userRating = user.rating || 1000;

    let targetRatings;

    if (difficulty === "easy") {
      targetRatings = [
        userRating - 300,
        userRating - 200,
        userRating - 100,
        userRating,
      ];
    } else if (difficulty === "hard") {
      targetRatings = [
        userRating,
        userRating + 100,
        userRating + 200,
        userRating + 300,
        userRating + 400,
      ];
    } else {
      targetRatings = [
        userRating - 200,
        userRating - 100,
        userRating,
        userRating + 100,
        userRating + 200,
      ];
    }

    const selectedProblems = [];

    for (const target of targetRatings) {
      const candidates = problems.filter((problem) => {
        const key = `${problem.contestId}-${problem.index}`;

        const tagMatch =
          tags.length === 0 || problem.tags.some((tag) => tags.includes(tag));

        return (
          !solved.has(key) &&
          problem.rating &&
          Math.abs(problem.rating - target) <= 100 &&
          tagMatch
        );
      });

      if (candidates.length === 0) {
        continue;
      }

      const idx = Math.floor(Math.random() * candidates.length);

      selectedProblems.push(candidates[idx]);
    }

    const contest = await createContest({
      user_id: dbUser.id,
      duration
    })

    for(const problem of selectedProblems) {
      await createContestProblems({
        contest_id: contest.id,
        contest_id_cf: problem.contestId,
        problem_index: problem.index,
        problem_name: problem.name,
        rating: problem.rating
      })
    }

    return res.status(200).json({
      contestId: contest.id
    })


  } catch (err) {
    return res.status(500).json({
      error: "Failed to generate contest",
    });
  }
};

const generateTestContest = async (req, res) => {
  const { handle, duration } = req.body;

  if (!handle) {
    return res.status(400).json({
      error: "Handle is required",
    });
  }

  try {
    const userRes = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );

    const statusRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );

    const problemsRes = await axios.get(
      "https://codeforces.com/api/problemset.problems"
    );

    const user = userRes.data.result[0];
    const submissions = statusRes.data.result;
    const problems = problemsRes.data.result.problems;

    let dbUser = await getUserByHandle(handle);

    if (!dbUser) {
      dbUser = await createUser({
        handle,
        rating: user.rating,
      });
    }

    const solved = new Set();

    for (const sub of submissions) {
      if (sub.verdict === "OK") {
        solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    }

    const targetRatings = [800, 800, 800, 900, 900, 1000];

    const selectedProblems = [];
    const used = new Set();

    for (const target of targetRatings) {
      const candidates = problems.filter((problem) => {
        const key = `${problem.contestId}-${problem.index}`;

        return (
          !solved.has(key) &&
          !used.has(key) &&
          problem.rating === target
        );
      });

      if (candidates.length === 0) continue;

      const chosen =
        candidates[Math.floor(Math.random() * candidates.length)];

      selectedProblems.push(chosen);
      used.add(`${chosen.contestId}-${chosen.index}`);
    }

    const contest = await createContest({
      user_id: dbUser.id,
      duration,
    });

    for (const problem of selectedProblems) {
      await createContestProblems({
        contest_id: contest.id,
        contest_id_cf: problem.contestId,
        problem_index: problem.index,
        problem_name: problem.name,
        rating: problem.rating,
      });
    }

    return res.status(200).json({
      contestId: contest.id,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to generate test contest",
    });
  }
};

const getContestProblems = async (req, res) => {
    const {contestId} = req.params;  
    try {
      const problems = await getContestProblemsById(contestId);    
      const contest = await getContestById(contestId);
      const duration = contest.duration;
      const createdAt = contest.created_at;
    
      const endTime = new Date(createdAt).getTime() + duration * 60 * 1000;
      if (!contest.is_ended && Date.now() >= endTime) {
          await endContestById(contestId);
          contest.is_ended = true;
      }

      const user = await getUserById(contest.user_id);
      const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${user.handle}`);
      const submissions = statusRes.data.result;

      const solved = new Set();
      const attempted = new Set();

      for(const sub of submissions){
          const key = `${sub.problem.contestId}-${sub.problem.index}`;
          attempted.add(key);
          if(sub.verdict === "OK"){
              solved.add(key);
          }
      }

      const progress = problems.map(problem => {
            const key = `${problem.contest_id_cf}-${problem.problem_index}`
            let status = "pending";
            if (solved.has(key)) {
                status = "solved";
            } else if (attempted.has(key)) {
                status = "wrong";
            }
            else {
                status = "pending";
            }
            return {...problem, status};
        });
      
      return res.status(200).json({problems: progress, duration, createdAt, isEnded: contest.is_ended});
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get problems",
      });
    }
}

const endContest = async (req, res) => {
    const {contestId} = req.params;
      
    try {
        await endContestById(contestId);
        return res.status(200).json({
            message: "Contest ended successfully"
        });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to end contest"
        });
    }
}

export { generateContest, generateTestContest, getContestProblems, endContest };
