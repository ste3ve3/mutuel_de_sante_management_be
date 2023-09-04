import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const sponsorSchema = new Schema(
  {
    names: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Sponsor', sponsorSchema);