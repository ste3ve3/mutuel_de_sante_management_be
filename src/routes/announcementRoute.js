import express from "express";
import AnnouncementController from "../controllers/AnnouncementController.js";
import authentication from "../middlewares/authentication.js";

const router = express.Router();

router.post( '/', authentication.authLogin, AnnouncementController.createAnnouncement);
router.get( '/', AnnouncementController.getAllAnnouncements);
router.patch( '/', authentication.authLogin, AnnouncementController.updateAnnouncement);
router.delete( '/', authentication.authLogin, AnnouncementController.deleteAnnouncemeent);
router.get( '/getSingleAnnouncement', AnnouncementController.getSingleAnnouncement);

export default router;