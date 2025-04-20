import express from "express";
import ApplicationController from "../controllers/application.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();
// Nộp đơn ứng tuyển
router.get("/apply/:id", isAuthenticated, ApplicationController.applyJobs);
// Lấy danh sách đơn ứng tuyển của một công việc cụ thể
router.get("/job/:jobId", isAuthenticated, ApplicationController.getJobApplication);
// Lấy tất cả đơn ứng tuyển của người dùng hiện tại
router.get("/user", isAuthenticated, ApplicationController.getUserApplications);
// Cập nhật trạng thái đơn ứng tuyển
router.put("/status/:applicantId", isAuthenticated, ApplicationController.updateApplicationStatus);
// Lấy tất cả công việc mà người dùng đã ứng tuyển
router.get("/applied-jobs", isAuthenticated, ApplicationController.getAppliedJobs);

export default router;
