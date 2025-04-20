import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./utils/prismaClient.js";
import userRouter from "./router/user.router.js";
import companyRouter from "./router/company.router.js";
import JobRouter from "./router/job.router.js";
import applicationRouter from "./router/application.route.js";

dotenv.config({});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin:'http://localhost:5173',
    credentials:true,
}
app.use(cors(corsOptions));

// API
app.use("/api/v1/user", userRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/job", JobRouter);
app.use("/api/v1/application", applicationRouter)

app.listen(PORT, async() => {
    try {
        const dbTime = await prisma.$queryRaw`SELECT NOW()`;
        console.log('Server running at port', PORT);
        console.log('⏰ Database time:', dbTime[0].now);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
})  
