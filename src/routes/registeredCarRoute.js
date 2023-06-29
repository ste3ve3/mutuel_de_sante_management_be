import express from "express";
import RegisteredCarsController from "../controllers/RegisteredCarsController.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.post( '/', authentication.authLogin, RegisteredCarsController.registerCar );
router.get( '/', RegisteredCarsController.getRegisteredCars );
router.delete( '/', RegisteredCarsController.deleteCar );
router.patch( '/carClearance', RegisteredCarsController.carClearance );
router.post( '/moveToAuction', RegisteredCarsController.moveToAuction );
router.get( '/userCars', authentication.authLogin, RegisteredCarsController.userRegisteredCars );

export default router;