import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const underprivilegedSchema = new Schema(
  {
    names: {
      type: String,
      required: true,
    },

    passportPhoto: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    nationalId: {
      type: String,
      required: true,
    },

    residentCell: {
      type: String,
      required: true,
    },

    hasSponsor: {
      type: Boolean,
      default: false
    },
    
    sponsorId: {
        type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Underprivileged', underprivilegedSchema);