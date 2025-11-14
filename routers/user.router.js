import { Router } from "express";
import { signUp, signIn,resetPass, passwordReset,updatePassword } from "../controllers/user.controller.js";

const router = Router();


router.post('/sign-up',signUp)
router.post('/sign-in',signIn)
router.post('/reset',resetPass)
router.get('/password-rest/:id',passwordReset)
router.post('/updatePass',updatePassword)


export default router;