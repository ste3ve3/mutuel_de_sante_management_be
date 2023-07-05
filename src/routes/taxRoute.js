import express from "express";
import TaxesController from "../controllers/TaxesController.js";

const router = express.Router();

router.post("/", TaxesController.addTaxes);
router.get('/', TaxesController.getTaxes);
router.patch('/', TaxesController.udpateTaxes);

export default router;