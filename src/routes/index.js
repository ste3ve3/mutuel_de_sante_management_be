import { Router } from "express";
import authRoute from "./authRoute.js";

const routes = Router();

routes.use("/auth", authRoute);

export default routes;