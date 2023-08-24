import express from "express";
import StudentsController from "../controllers/StudentsController.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.post("/", StudentsController.createNewStudent);
router.get('/', StudentsController.getAllStudents);
router.delete('/', StudentsController.deleteStudent);
router.post('/login', StudentsController.loginStudent);

export default router;