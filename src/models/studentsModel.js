import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    regNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Student', studentSchema);