import express from "express";
import AuthController from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/mutler.js";
const router = express.Router();

// Register a new user;
router.post("/register", singleUpload, AuthController.register);
// Login user;
router.post("/login", AuthController.login);
// logout user;
router.get("/logout", AuthController.logout);
// update user profile
router.post("/profile/update", isAuthenticated,  AuthController.updateProfile);
export default router;
