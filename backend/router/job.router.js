import express from "express";
import JobController from "../controllers/job.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/post", isAuthenticated, JobController.postJob);
router.get("/get", isAuthenticated, JobController.getAllJobs);
router.get("/getadminjobs", isAuthenticated, JobController.getAdminJobs);
router.get("/get/:id", isAuthenticated, JobController.getJobById);

export default router;