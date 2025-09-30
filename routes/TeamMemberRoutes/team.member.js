import express from 'express';
import {
    protectedRoutes 
} from '../../middleware/authMiddleware.js';

import {
    Createteam,
    getTeam,
    deleteTeam,
    updateTeam,
    addEmployeeToTeam
} from '../../controllers/TeamController/team.controller.js';

const router = express.Router();

router.post('/create-team', protectedRoutes, Createteam);

router.get('/get-all/teams', protectedRoutes, getTeam);

router.delete('/delete/:teamId', protectedRoutes, deleteTeam);

router.put('/update/:teamId', protectedRoutes, updateTeam);

router.post('/add-employee/:teamId', protectedRoutes, addEmployeeToTeam);

export default router;