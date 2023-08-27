import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    regNumber: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', userSchema);