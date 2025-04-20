import express from "express";
import CompanyController from "../controllers/company.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", isAuthenticated, CompanyController.registerCompany);
router.get("/get", isAuthenticated, CompanyController.getAllCompanies);
router.get("/get/:id", isAuthenticated, CompanyController.getCompanyById);
router.put("/update/:id", isAuthenticated, CompanyController.updateCompany);

export default router;