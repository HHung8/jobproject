import prisma from "../utils/prismaClient.js";

class ApplicationController {
    static async applyJobs(req,res) {
        try {
            const {jobId} = req.body;
            const applicantId = req.id;
            // Kiểm tra job có tồn tại không
            const job = await prisma.$queryRaw `
                SELECT * FROM "Job" WHERE id = ${jobId}
            `
            if(!job || job.length === 0) {
                return res.status(404).json({
                    message:"Job not found",
                    success: false
                });
            }
            
            // Kiểm tra xem user đã apply job này hay chưa
            const existingApplication = await prisma.$queryRaw `
                SELECT * FROM "Application"
                WHERE "jobId" = ${jobId}
                AND "applicantId" = ${applicantId}
            `;

            if (existingApplication && existingApplication.length > 0) {
                return res.status(400).json({
                  message: "You have already applied for this job",
                  success: false,
                })
            }

            // Tạo application mới
            await prisma.$executeRaw `
                INSERT INTO "Application"
                (id, "jobId","applicantId", status, "createdAt", "updatedAt")
                VALUES(gen_random_uuid(), ${jobId}, ${applicantId}, "PENDING", NOW(), NOW())
            `
            
            
            return res.status(201).json({
                message: "Job application submit successfully",
                success: true,
            })
        } catch (error) {
            console.error("Error applying for job: ", error);
            return res.status(500).json({
                message:"Internal server error",
                success: false,
                error: error.message
            })            
        }
    }

    // Lấy đơn ứng tuyển cho 1 công việc cụ thể
    static async getJobApplication (req,res) {
        try {
            const {jobId} = req.params;
            // Kiểm tra 
            const job = await prisma.$queryRaw`
                SELECT * FROM "Job" WHERE id = ${jobId};
            `
            if(!job || !job.length === 0) {
                return res.status(401).json({
                    message:"Job not found",
                    success: false,
                })
            };
            
            // Lấy danh sách  ứng viên với thông tin người dùng
            const applications = await prisma.$queryRaw`
                SELECT a.*, u.fullname, u.email, p.*
                FROM "Application" a
                JOIN "User" u ON a. "applicantId" = u.id
                LEFT JOIN "Profile" p ON u.id = p."userId"
                WHERE a."jobId" = ${jobId}
            ` 
            return res.status(200).json({
                message:"Applications retrieved successfully",
                success: true,
                data: applications,
            })
        } catch (error) {
           console.error("Error getting jobs applications", error)
           return res.status(500).json({
                message: "Internal Server Error",
                success:false,
                error: error.message
           })
        }
    }
    
    // Lấy tất cả đơn ứng tuyển của 1 người dùng
    static async getUserApplications(req, res) {
        try {
            const applicantId = req.id;
            const applications = await prisma.$queryRaw `
                SELECT a.*, j.title, j.description, j.salary, c.name as "companyName", c.logo as "companyLogo"
                FROM "Application" a
                JOIN "job" j ON a."jobId" = j.id
                JOIN "Company" c ON a."companyId" = c.id
                WHERE a."applicantId" = ${applicantId}
            `
            return res.status(200).json({
                message: "User applications retrieved successfully",
                success: true,
                data: applications,
            })
        } catch (error) {
            console.error("Error getting user application: ", error)
            return res.status(500).json({
                message:"Internal server error",
                success: false,
                error: error.message
            })
        }
    };
    
    // Cập nhập trạng thái đơn ứng tuyển
    static async updateApplicationStatus(req,res){
        try {
            const {applicantId} = req.params;
            const {status} = req.body;
            if(!["PENDING", "ACCEPTED", "REJECTED"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid status. Must be PENDING, ACCEPT, REJECTED",
                    success: false,
                })
            }
            // Kiểm tra đơn ứng tuyển có tồn tại hay không
            const application = await prisma.$queryRaw `
                SELECT * FROM "Application" WHERE id = ${applicantId}
            `
            if(!application || !application.length === 0) {
                return res.status(404).json({
                    message: "Application not found",
                    success: false,
                })
            }
            // Cập nhập trang thái đơn ứng tuyển
            await prisma.$executeRaw `
                UPDATE "Application"
                SET status = ${status}:::"ApplicationStatus", "updatedAt" = NOW()
                WHERE id = ${applicantId};
            `
            return res.status(200).json({
                message: "Applications status updated successfully",
                success: true,
            })
        } catch (error) {
            console.error("Error updating application status: ", error)
            return res.status(500).json({
                message: "Internal server error",
                success: false,
                error: error.message
            })
        }
    }


    // Tất cả công việc mà người dùng ứng tuyển
    static async getAppliedJobs (req,res) {
        try {
            const applicantId = req.id
            const appliedJobs = await prisma.$queryRaw `
                SELECT j.*, c.name as "companyName", c.logo as "companyLogo", a.status as "applicationStatus", a.id as "applicationId", a."createdAt" as "appliedAt"    
                FROM "job" j
                JOIN "Application" a ON j.id = a."jobId"
                JOIN "Company" c ON j."companyId" = c.id
                WHERE a."applicantId" = ${applicantId}
                ORDER BY a."createdAt" DESC
            `
            return res.status(200).json({
                message:"Applied jobs retrieved successfully",
                success: true,
                data:appliedJobs,
            })
        } catch (error) {
            console.error("Error getting applied jobs ", error);
            return res.status(500).json({
                message:"Internal server error",
                success: false,
                error: error.message
            })
        }
    }
    

}

export default ApplicationController;