import { Router } from "express";
import authRoute from "./authRoute.js";
import studentRoute from "./studentRoute.js"

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/student", studentRoute);

export default routes;