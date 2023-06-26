import { Router } from "express";
import authRoute from "./authRoute.js";
import auctionRoute from "./auctionRoute.js"

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/auction", auctionRoute);

export default routes;