import express from "express";
import SponsorController from "../controllers/SponsorController.js";

const router = express.Router();

router.post( '/', SponsorController.addSponsor);
router.get( '/', SponsorController.getAllSponsors);
router.patch( '/', SponsorController.updateSponsor);
router.delete( '/', SponsorController.deleteSponsor);

export default router;