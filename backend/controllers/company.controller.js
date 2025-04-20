import prisma from "../utils/prismaClient.js";
import {v4 as uuidv4} from "uuid";

class CompanyController {
    static async registerCompany(req, res) {
        try {
            const { companyName, description, website, location, logo } = req.body; // 🛠️ Đảm bảo không bị khai báo trùng
    
            if (!companyName) {
                return res.status(400).json({
                    message: "Company name is required.",
                    success: false
                });
            }
    
            // Kiểm tra xem công ty đã tồn tại chưa
            const existingCompany = await prisma.$queryRaw`
                SELECT * FROM "Company" WHERE name = ${companyName} LIMIT 1;
            `;
    
            if (existingCompany.length > 0) {
                return res.status(400).json({
                    message: "This company name already registered.",
                    success: false
                });
            }
            const userId = uuidv4()
            // 🛠️ Thêm dữ liệu vào database
            const registerCompany = await prisma.$queryRawUnsafe(
                `INSERT INTO "Company" (id, name, description, website, location, logo, "userId", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                 RETURNING *`,
                userId, companyName, description || null, website || null, location || null, logo || null, req.id
            );
            
            return res.status(201).json({
                message: "Company registered successfully.",
                success: true,
                data: registerCompany[0],
            });
    
        } catch (error) {
            console.error("Error registering company:", error);
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
                error: error.message
            });
        }
    }

    static async getAllCompanies(req,res) {
        try {
            const companies = await prisma.$queryRaw `
                SELECT * FROM "Company" ORDER BY "createdAt" DESC
            `;
            return res.status(200).json({
                message: "Companies fetched successfully",
                success: true,
                data: companies
            })
        } catch (error) {
            console.error("Error fetching companies",  error);
            return res.status(500).json({
                message: "Internal Server error",
                success: false,
                error: error.message,
            })
        }
    }

    static async getCompanyById(req,res) {
        try {
            const {id} = req.params;
            const company = await prisma.$queryRaw `
                SELECT * FROM "Company" WHERE id = ${id} LIMIT 1;
            `;
            
            if(company.length === 0 ) {
                return res.status(404).json({
                    message:"Company not found.",
                    success:false,
                })
            }

            return res.status(200).json({
                message:"Company fetched successfully.",
                success:true,
                data: company[0]
            })
        } catch (error) {
            console.error("Error fetching company:", error);
            return res.status(500).json({
                message:"Internal server error.",
                success:false,
                error: error.message,
            })
        }
    }

    static async updateCompany(req,res) {
        try {
            console.log("Request Body:", req.body); 

            const {id} = req.params;
            const {companyName, description, website, location, logo} = req.body;

            const file = req.file;
            const existingCompany = await prisma.$queryRaw `
                SELECT * FROM "Company" WHERE id = ${id} LIMIT 1;
            `;
            if (existingCompany.length === 0) {
                return res.status(404).json({
                    message: "Company not found.",
                    success: false,
                });
            }
    

            const updateCompany = await prisma.$executeRaw`
            UPDATE "Company" 
            SET 
                "name"=${companyName || existingCompany[0].name},
                "description"=${description || existingCompany[0].description},
                "website"=${website || existingCompany[0].website}, 
                "location"=${location || existingCompany[0].location},
                "logo"=${logo || existingCompany[0].logo},
                "updatedAt"=NOW()
            WHERE id=${id};
            `;
            
            console.log("Rows affected:", updateCompany);
            console.log("Old Data:", existingCompany[0]);
            console.log("New Data:", { companyName, description, website, location, logo });
            
            return res.status(200).json({
                message:"Company updated successfully",
                success:true,
                data: updateCompany,
            });

        } catch (error) {
            console.error("Error updating company:", error);
            return res.status(500).json({
                message: "Internal server error",
                success: false,
                error: error.message,
            })
        }
    }
};

export default CompanyController;