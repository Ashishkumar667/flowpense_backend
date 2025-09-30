import prisma from '../../config/db.js';
import asyncHandler from 'express-async-handler';

export const Createteam = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { TeamName, Description, MonthlyBudget } = req.body;
        
        if (!TeamName || !Description || !MonthlyBudget) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Only admin users can create teams" });
        }

        const newTeam = await prisma.team.create({
            data: {
                TeamName,
                Description,
                MonthlyBudget,
                companyId: user.companyId
            }
        });

        res.status(201).json({ success: true, team: newTeam });
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ error: "Failed to create team", message: error.message });
    }   
});

export const getTeam = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Only admin users can access teams" });
        }   

        const teams = await prisma.team.findMany({
            where: { companyId: user.companyId }
        });

        res.status(200).json({ success: true, teams });

    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ error: "Failed to fetch teams", message: error.message });
    }

});

export const deleteTeam = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { teamId } = req.params;

        if (!teamId) {
            return res.status(400).json({ error: "Team ID is required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Only admin users can delete teams" });
        }   

        const team = await prisma.team.findUnique({
            where: { id: parseInt(teamId) }
        });

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        if (team.companyId !== user.companyId) {
            return res.status(403).json({ error: "You can only delete teams within your company" });
        }

        await prisma.team.delete({
            where: { id: parseInt(teamId) }
        });

        res.status(200).json({ success: true, message: "Team deleted successfully" });

    }

    catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({ error: "Failed to delete team", message: error.message });
    }

});

export const updateTeam = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId } = req.params;
    const { TeamName, Description, MonthlyBudget } = req.body;
    if (!teamId) {
        return res.status(400).json({ error: "Team ID is required" });  
    }

    if (!TeamName && !Description && !MonthlyBudget) {
        return res.status(400).json({ error: "Atleast one field is required" });
    }

    const user = await prisma.user.findUnique({

        where: { id: userId }   
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "ADMIN") {
        return res.status(403).json({ error: "Only admin users can update teams" });
    }

    const team = await prisma.team.findUnique({
        where: { id: parseInt(teamId) }
    });

    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }

    if (team.companyId !== user.companyId) {
        return res.status(403).json({ error: "You can only update teams within your company" });    
    }

    const updatedTeam = await prisma.team.update({
        where: { id: parseInt(teamId) },
        data: {
            TeamName,
            Description,
            MonthlyBudget
        }
    });

    res.status(200).json({ success: true, team: updatedTeam });

  }

    catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Failed to update team", message: error.message });
  }
});

export const addEmployeeToTeam = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id; 
    const { teamId } = req.params;
    const { employeeId, fullName, jobTitle, email, department } = req.body;

    if (!teamId || !employeeId) {
      return res.status(400).json({ error: "Team ID and Employee ID are required" });
    }

    const user = await prisma.user.findUnique({ 
        where: { id: userId } 
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admin users can add employees to teams" });
    }

    const team = await prisma.team.findUnique({ 
        where: { id: parseInt(teamId) }
     });

    if (!team) return res.status(404).json({ 
        error: "Team not found" 
    });

    if (team.companyId !== user.companyId) {
      return res.status(403).json({ error: "You can only manage teams within your company" });
    }

    const employee = await prisma.user.findUnique({ 
        where: { id: employeeId } 
    });

    if (!employee) return res.status(404).json({ 
        error: "Employee not found" 
    });

    if (employee.companyId !== user.companyId) {
      return res.status(403).json({ error: "You can only add employees within your company" });
    }

    if (employee.role === "ADMIN") {
      return res.status(400).json({ error: "Admin users cannot be added to teams" });
    }

   
    const newTeamMember = await prisma.teamEmployee.create({
      data: {
        teamId: team.id,
        userId: employee.id,
        department,
        jobTitle,
        fullName,
        email,
      },
    });

   
    const totalTeamMembers = await prisma.teamEmployee.count({
      where: { teamId: team.id },
    });

    await prisma.team.update({
      where: { id: team.id },
      data: { TotalMembers: totalTeamMembers },
    });

    res.status(200).json({
      success: true,
      message: "Employee added to team successfully",
      member: newTeamMember,
    });

  } catch (error) {
    console.error("Error adding employee to team:", error);
    res.status(500).json({ error: "Failed to add employee to team", message: error.message });
  }
});
