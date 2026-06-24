import {Router} from 'express';
import { generateContest, getContestProblems } from '../controllers/contest.js';

const router = Router();

router.route('/generate-contest').post(generateContest);
router.route('/contest/:contestId').get(getContestProblems);

export default router;