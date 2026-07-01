import {Router} from 'express';
import { endContest, generateContest, generateTestContest, getContestProblems } from '../controllers/contest.js';

const router = Router();

router.route('/generate-contest').post(generateContest);
router.route('/generate-test-contest').post(generateTestContest);
router.route('/contest/:contestId').get(getContestProblems);
router.route('/contest/:contestId/end').patch(endContest);

export default router;