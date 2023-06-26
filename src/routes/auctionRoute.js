import express from "express";
import AuctionController from "../controllers/AuctionController.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.post( '/', authentication.authLogin, AuctionController.addToAuction );
router.get( '/', AuctionController.getAuctionCars );

export default router;