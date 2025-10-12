import prisma from '../../config/db.js';
import asyncHandler from 'express-async-handler';
import redisClient from '../../config/cache/redis.js';
import {
  sendEmailToEmployee
} from '../../utils/email/emailtemplate/email.template.js';
import {
  SendingNotification
} from '../../utils/Notification/Notification.js';

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

    if (!user) return res.status(404).json({ 
        error: "User not found" 
    });

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admin users can access teams" });
    }

    
    const redisKey = `company_${user.companyId}_teams`;

    const cachedData = await redisClient.get(redisKey);
    if (cachedData) {
      console.log(`⚡ Fetched teams from Redis for company ${user.companyId}`);
      return res.status(200).json({
        success: true,
        message: "Fetched teams from cache",
        teams: JSON.parse(cachedData)
      });
    }

    const teams = await prisma.team.findMany({
      where: { companyId: user.companyId },
      include: {
        Members: {
          include: {
            user: {
              select: {
                     id: true,
                     firstName: true,
                     lastName: true,
                     email: true
              }
            }
          }
        }
      }
    }); //add team menbers details as well

    await redisClient.set(redisKey, JSON.stringify(teams), { EX: 120 });

    res.status(200).json({ 
        success: true, teams 
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ 
        error: "Failed to fetch teams", 
        message: error.message 
    });
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
        if(team.TotalMembers > 0){      //deleting team members if exist to avoid foreign key issue in prisma
          await prisma.teamMember.deleteMany({
              where: { teamId: parseInt(teamId) }
          });
      }

        await prisma.team.delete({
            where: { id: parseInt(teamId) }
        });

            const redisKey = `company_${user.companyId}_teams`;
            await redisClient.del(redisKey);

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

    await redisClient.del(`company_${user.companyId}_teams`);
    

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
    const { employeeId } = req.body;  //userId,  will add more when it is clear

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

   
    const newTeamMember = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: employee.id,
      },
    });

   
    // const totalTeamMembers = await prisma.teamMember.count({
    //   where: { teamId: team.id },
    // });

    await prisma.team.update({
      where: { id: team.id },
      data: { TotalMembers:{ increment: 1} },
    });

    await SendingNotification(
      employeeId,
      `You have been added to the team: ${team.TeamName} in company: ${user.companyId}`
    );

    await redisClient.del(`company_${user.companyId}_teams`);


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


export const addEmployeeToCompany = asyncHandler(async(req,res) => {
  try {
    const userId = req.user.id;

    const { fullName, jobTitle, email, department } = req.body;

    if(!fullName || !jobTitle || !email || !department){
       return res.status(400).json({
          message:"All fields are required"
       });
    }

    const user = await prisma.user.findUnique({
      where: {id: userId}
    });

    if(user.role !==  "ADMIN"){
      return res.status(403).json({
        message:"Only Admin can add employee"
      })
    };

    const employee = await prisma.employeeData.create({
       data:{
          department,
          jobTitle,
          fullName,
          email,
          companyId: user.companyId,
       }
    });

    await sendEmailToEmployee(
            email,
            fullName,
            jobTitle,
            department,      
    );

    await redisClient.del(`company_${user.companyId}_employees`);

    res.status(200).json({
      message:"Employee added successfully",
      Employee: employee
    });
    
  } catch (error) {
    console.error("Error adding employee :", error);
    res.status(500).json({ error: "Failed to add employee", message: error.message });
  }
});

export const getAllEmployee = asyncHandler(async(req, res) => {
  try {
    const userId = req.user.id;
    //const { companyId } = req.query;

    const user = await prisma.user.findUnique({
      where: {id :userId }
    });

    if(!user.role == "ADMIN"){
      return res.status(403).json({
        message:"Only admin can view this"
      })
    };

    const cachedKey = `company_${user.companyId}_employees`;
    const cachedData = await redisClient.get(cachedKey);

    if(cachedData){
      return res.status(200).json({
                    message:"Employee fetched from cache",
                    success: true,
                    user: JSON.parse(cachedData)
            });
    }

    const employee = await prisma.employeeData.findMany({
      where: { companyId: user.companyId },
      include:{
        company: true,
      }
    });

    if(!employee){
      return res.status(404).json({
        message:"Employee data not found"
      })
    };

    await redisClient.set(cachedKey, JSON.stringify(employee), {EX:60});
    
    res.status(200).json({
        success:true,
        message:"Employee data feched successfully",
        Employee:employee
    });

  } catch (error) {
    console.error("Error getting employee :", error);
    res.status(500).json({ error: "Failed to get employee", message: error.message });
  }
})