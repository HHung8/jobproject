    import prisma from "../utils/prismaClient.js";
    import {v4 as uuidv4} from "uuid";

    class JobController {
        static async postJob(req, res) {
            try {
                const {title, description, requirements, salary, location, jobType, experience, position, companyId} = req.body;
                const userId = req.id;
                
                // Check if userId exists
                if (!userId) {
                    return res.status(401).json({
                        message: "User authentication required",
                        success: false
                    });
                }
                
                if(!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
                    return res.status(400).json({
                        message: "Something is missing",
                        success: false
                    });
                }  
                
                // Check if company exists
                const existingCompany = await prisma.$queryRaw`
                    SELECT * FROM "Company" WHERE id = ${companyId} LIMIT 1;
                `;
                
                if(existingCompany.length === 0) {
                    return res.status(404).json({
                        message: "Company not found",
                        success: false,
                    });
                }
                
                const jobId = uuidv4();
        
                // Create new job using Prisma Client instead of raw SQL
                const insertedJobs = await prisma.$queryRaw`
                    INSERT INTO "Job"
                    ("id", "title", "description", "requirements", "salary", "location", "jobType", "experienceLevel", "position", "companyId", "createdById", "createdAt", "updatedAt")
                    VALUES
                    (
                        ${jobId}, 
                        ${title}, 
                        ${description}, 
                        ${Array.isArray(requirements) ? requirements : [requirements]}::text[], 
                        ${parseFloat(salary)}::float8, 
                        ${location}, 
                        ${jobType}, 
                        ${parseInt(experience)}::integer, 
                        ${parseInt(position)}::integer, 
                        ${companyId}, 
                        ${userId}, 
                        NOW(),
                        NOW()
                    )
                    RETURNING *
                `;
                const insertedJob = insertedJobs[0];
                
                return res.status(201).json({
                    message: "Job posted successfully",
                    success: true,
                    data: insertedJob
                });
            } catch (error) {   
                console.error("Error posting job: ", error);
                return res.status(500).json({
                    message: "Internal server error",
                    success: false,
                    error: error.message,
                });
            }
        }
    static async getAllJobs (req,res) {
            try {
            const {keyword = ""} = req.query;
            const jobs = await prisma.$queryRaw `
                SELECT j.*, row_to_json(c) as company
                FROM "Job" j
                LEFT JOIN "Company" c ON j."companyId" = c.id
                WHERE 
                    j.title ILIKE ${'%' + keyword + '%'}
                    OR j.description ILIKE ${'%' + keyword + '%'}
                ORDER BY j."createdAt" DESC
            `
        
            return res.status(200).json({
                    message:"Jobs retrieved successfully",
                    success: true,
                    data: jobs
            })
            
            } catch (error) {
                console.error("Error fetching jobs", error);
                return res.status(500).json({
                    message:"Internal server error",
                    success:false,
                    error: error.message
                })
            }
    }    
    static async getJobById (req,res) {
            try {
                const {id} = req.params;
                const job = await prisma.$queryRaw`
                    SELECT * FROM "Job" WHERE id = ${id} LIMIT 1;
                `;
                if(job.length === 0) {
                    return res.status(404).json({
                        message:"Job not found",
                        success: false,
                    });
                }
                return res.status(200).json({
                    message: "Job retrieved successfully",
                    success:true,
                    data: job[0],
                })
            } catch (error) {
                console.error("Error fetching job by ID:", error);
                return res.status(500).json({
                    message:"Internal server Error",
                    success: false,
                    error: error.message,
                })
            }
    }
    static async getAdminJobs(req,res) {
            try {
                const adminId = req.id;
                const jobs = await prisma.$queryRaw `
                    SELECT * FROM "Job" 
                    WHERE "createdById" = ${adminId}
                    ORDER BY "createdAt" DESC
                    
                `
                return res.status(200).json({
                    message:"Admin jobs retrieved successfully",
                    success: true,
                    data: jobs,
                });

            } catch (error) {
                console.error("Error fetching admin jobs", error);
                return res.status(500).json({
                    message: "Internal server error",
                    success: false,
                    error: error.message,
                })
            }
    }
    };

export default JobController;