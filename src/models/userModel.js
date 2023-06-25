import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    names: {
      type: String,
      required: true,
    },

    nationalId: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    repeatPassword: {
      type: String,
      required: true,
    },

    emailToken: {
      type: String,
    },

    isVerified: {
      type: Boolean,
    },

    role: {
      type: String,
      default: 'user',
      enum: [
        'user',
        'admin'
      ],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', userSchema);