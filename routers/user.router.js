import { Router } from "express";
import { signUp } from "../controllers/user.controller.js";
const router = Router();


router.post('/sign-up',signUp)


export default router;