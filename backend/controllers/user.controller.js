import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import {v4 as uuidv4} from "uuid";
import jwt from "jsonwebtoken";

class AuthController {
    static async register(req,res) {
        try {
            const {fullname, email, phoneNumber, password, role} = req.body;
            console.log(fullname, email, phoneNumber, password, role)
            if(!fullname || !email || !phoneNumber || !password || !role) {
                return res.status(400).json({
                    message:"Something is missing",
                    success: false
                });
            };
            const user = await prisma.$queryRaw `
                SELECT * FROM "User" WHERE email = ${email}`;
            if(user.length > 0) {
                return res.status(400).json({
                    message:"User already exist with this email",
                    success:false,
                })
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4()
            
            await prisma.$executeRaw`
                INSERT INTO "User" (id, fullname, email, "phoneNumber", password, role, "createdAt", "updatedAt" )
                VALUES (${userId}, ${fullname}, ${email}, ${phoneNumber}, ${hashedPassword}, ${role}::"Role", NOW(), NOW())
            `;
            return res.status(201).json({
                message: "User registered successfully",
                success: true,
            })
        } catch (error) {
            console.error("Error in register:", error);
            return res.status(500).json({
                message:"Internal server error",
                success:false,
            })
        }
    }

    static async login(req,res) {
        try {
            const {email, password, role} = req.body;
            if(!email || !password || !role) {
                return res.status(400).json({
                    message:"Something is missing",
                    success:false
                });
            };

            // Tìm user bằng SQL
            const user = await prisma.$queryRaw`
                SELECT * FROM "User" WHERE email = ${email}`;

            if(!user || user.length === 0) {
                return res.status(400).json({
                    message: "Incorrect email or password.",
                    success: false,
                })
            }
            const existingUser = user[0]

            const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
            if(!isPasswordMatch) {
                return res.status(401).json({
                    message:"Incorrect email or password",
                    success: false,
                })
            }
            
            if(role.toUpperCase() !== existingUser.role.toUpperCase()) {
                return res.status(400).json({
                    message:"Access doesn't exits with current role.",
                    success:false,
                })
            }
            
            // Tạo token JWT
            const token = jwt.sign(
                {id: existingUser.id, email:existingUser.email, role: existingUser.role},
                process.env.JWT_SECRET,
                {expiresIn: "1h"}
            );
            
           return res.status(200)
           .cookie("token", token, {maxAge:1*24*60*60*1000, httpsOnly:true, sameSite:'strict'})
           .json({
                message:`Welcome back ${existingUser.fullname}`,
                success:true,
                token,
                user:{
                    id:existingUser.id,
                    fullname: existingUser.fullname,
                    email: existingUser.email,
                    role: existingUser.role,
                    phoneNumber: existingUser.phoneNumber,
                    profile: {
                        skills: existingUser.skills || [],
                        profilePhoto: existingUser.profilePhoto || ""
                    },
                }
           })
        } catch (error) {
            console.error("Error in login", error);
            return res.status(500).json({
                message:"Internal server error",
                success: false,
            })
        }
    }
    
    static async logout(req,res) {
        try {
            res.cookie("token","",{maxAge:0, httpsOnly:true, sameSite:'strict'});
            return res.status(200).json({
                message:"User logged out successfully",
                success:true,
            })
        } catch (error) {
            console.error("Error in logout", error)
            return res.status(500).json({
                message: "Internal server error",
                success: false,
            })
        }
    }

    static async updateProfile(req, res) {
        try {
            if (!req.id) {
                return res.status(401).json({
                    message: "User not authenticated",
                    success: false
                });
            }
    
            const { fullname, email, phoneNumber, bio, skills } = req.body;
    
            if (!fullname || !email || !phoneNumber || !bio || !skills) {
                return res.status(400).json({
                    message: "Something is missing",
                    success: false
                });
            }
    
            const user = await prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${req.id}`;
            if (!user || user.length === 0) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }
    
            await prisma.$executeRaw`
                UPDATE "User"
                SET 
                    fullname = COALESCE(${fullname}, fullname),
                    email = COALESCE(${email}, email),
                    "phoneNumber" = COALESCE(${phoneNumber}, "phoneNumber"),
                    bio = COALESCE(${bio}, bio),
                    skills = COALESCE(${skills}, skills)
                WHERE id = ${req.id}
            `;
    
            return res.status(200).json({
                message: "Profile updated successfully",
                success: true
            });
    
        } catch (error) {
            console.error("Error in updating profile", error);
            return res.status(500).json({
                message: "Internal server error",
                success: false
            });
        }
    }
    
}

export default AuthController