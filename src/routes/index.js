import { Router } from "express";
import authRoute from "./authRoute.js";
import studentRoute from "./studentRoute.js"
import announcementRoute from "./announcementRoute.js"

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/student", studentRoute);
routes.use("/announcement", announcementRoute);

export default routes;