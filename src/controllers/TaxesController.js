import taxesModel from "../models/taxesModel.js";

const addTaxes = async (request, response) => {
    try {
        const taxCalculationData = request.body;
        const newTaxCalculation = new taxesModel(taxCalculationData);
        const savedTaxCalculation = await newTaxCalculation.save();
    
        response.status(200).json(savedTaxCalculation);
      } catch (error) {
        response.status(500).json({ error: error.message });
      }
    };

const getTaxes = async (request, response) => {
    try {
        const taxCalculations = await taxesModel.find();
        response.status(200).json({ data: taxCalculations});
      } catch (error) {
        response.status(500).json({ error: error.message });
      }
    }

const udpateTaxes = async (request, response) => {
    try {
        const { taxCalculationId } = request.query;
        const updatedTaxCalculationData = request.body;
    
        const updatedTaxCalculation = await taxesModel.findByIdAndUpdate(
          taxCalculationId,
          updatedTaxCalculationData,
          { new: true }
        );
    
        if (!updatedTaxCalculation) {
          return response.status(404).json({ error: 'Tax Calculation not found' });
        }
    
        response.status(200).json(updatedTaxCalculation);
      } catch (error) {
        response.status(500).json({ error: error.message });
    }
}


export default {
    addTaxes,
    getTaxes,
    udpateTaxes
};