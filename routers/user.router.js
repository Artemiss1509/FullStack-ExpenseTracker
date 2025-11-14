import { Router } from "express";
import { signUp, signIn,resetPass } from "../controllers/user.controller.js";

const router = Router();


router.post('/sign-up',signUp)
router.post('/sign-in',signIn)
router.post('/reset',resetPass)


export default router;