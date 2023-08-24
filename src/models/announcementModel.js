import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const announcementSchema = new Schema(
  {
    title: {
      type: String,
    },

    announcementBody: {
      type: String,
    },

    category: {
      type: String,
    },

    headerImage: {
      type: String,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },

    announcementFile: {
      type: String
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Announcement', announcementSchema);