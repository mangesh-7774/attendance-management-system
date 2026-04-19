import express from "express";
import { getAllClass } from "../controllers/class.controller.js";
import { isLogedinUser } from "../middleware/isLogedinUser.js";
import { isAdmin } from "../middleware/isAdmin.js";

const classRouter = express.Router();

classRouter.get("/all-classes", isLogedinUser, isAdmin, getAllClass);

export default classRouter;
