import express from 'express';
import {
    protectedRoutes 
} from '../../middleware/authMiddleware.js';

import {
    Createteam,
    getTeam,
    deleteTeam,
    updateTeam,
    addEmployeeToTeam,
    addEmployeeToCompany,
    getAllEmployee
} from '../../controllers/TeamController/team.controller.js';

const router = express.Router();

router.post('/create-team', protectedRoutes, Createteam);

router.get('/get-all/teams', protectedRoutes, getTeam);

router.delete('/delete/:teamId', protectedRoutes, deleteTeam);

router.put('/update/:teamId', protectedRoutes, updateTeam);

router.post('/add-member/:teamId', protectedRoutes, addEmployeeToTeam);

router.post('/add-employee', protectedRoutes, addEmployeeToCompany);

router.get('/get-employee', protectedRoutes, getAllEmployee);

export default router;