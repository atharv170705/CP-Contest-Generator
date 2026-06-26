import {Router} from 'express';
import { endContest, generateContest, getContestProblems } from '../controllers/contest.js';

const router = Router();

router.route('/generate-contest').post(generateContest);
router.route('/contest/:contestId').get(getContestProblems);
router.route('/contest/:contestId/end').patch(endContest);

export default router;