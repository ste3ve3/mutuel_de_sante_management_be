import { Router } from "express";
import authRoute from "./authRoute.js";
import auctionRoute from "./auctionRoute.js"
import registeredCarRoute from "./registeredCarRoute.js"
import taxRoute from "./taxRoute.js"

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/auction", auctionRoute);
routes.use("/registercar", registeredCarRoute);
routes.use("/taxes", taxRoute);

export default routes;