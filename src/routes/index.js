import { Router } from "express";
import underPrivilegedRoute from "./underPrivilegedRoute.js"
import sponsorRoute from "./sponsorRoute.js"

const routes = Router();

routes.use("/person", underPrivilegedRoute);
routes.use("/sponsor", sponsorRoute);

export default routes;