import express from "express";
import AuctionController from "../controllers/AuctionController.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.post( '/', authentication.authLogin, AuctionController.addToAuction );
router.get( '/', AuctionController.getAuctionCars );
router.delete( '/', AuctionController.deleteCar );
router.patch( '/', AuctionController.editCar );
router.patch( '/publish', AuctionController.publishCar );
router.get( '/carDetails', AuctionController.getDetailedCar );

export default router;