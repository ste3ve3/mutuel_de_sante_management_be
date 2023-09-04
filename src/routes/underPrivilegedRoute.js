import express from "express";
import UnderprivilegedController from "../controllers/UnderprivilegedController.js";

const router = express.Router();

router.post( '/', UnderprivilegedController.addPerson);
router.get( '/', UnderprivilegedController.getAllPeople);
router.patch( '/', UnderprivilegedController.updatePerson);
router.patch( '/assignSponsor', UnderprivilegedController.assignSponsor);
router.get( '/viewSponsor', UnderprivilegedController.viewSponsor);
router.delete( '/', UnderprivilegedController.deletePerson);

export default router;