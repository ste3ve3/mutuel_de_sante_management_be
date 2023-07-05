import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const taxCalculationSchema = new Schema(
  {
    brandPercentage: {
      type: Number,
      required: true,
    },
    yearPercentage: {
      year2018to2023: {
        type: Number,
        required: true,
      },
      year2012to2017: {
        type: Number,
        required: true,
      },
      year2006to2011: {
        type: Number,
        required: true,
      },
      year2000to2006: {
        type: Number,
        required: true,
      },
      yearBefore2000: {
        type: Number,
        required: true,
      },
    },
    fuelTypePercentage: {
      type: Number,
      required: true,
    },
    mileagePercentage: {
      mileage0to9999: {
        type: Number,
        required: true,
      },
      mileage10000to99999: {
        type: Number,
        required: true,
      },
      mileage100000to300000: {
        type: Number,
        required: true,
      },
      mileageAbove300000: {
        type: Number,
        required: true,
      },
    },
    engineCapacityPercentage: {
      engineCapacityBelow1000: {
        type: Number,
        required: true,
      },
      engineCapacity1000to1999: {
        type: Number,
        required: true,
      },
      engineCapacity2000to2999: {
        type: Number,
        required: true,
      },
      engineCapacity3000to3999: {
        type: Number,
        required: true,
      },
      engineCapacityAbove4000: {
        type: Number,
        required: true,
      },
    },
    importDutyPercentage: {
      type: Number,
      required: true,
    },
    vatPercentage: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('TaxCalculation', taxCalculationSchema);
