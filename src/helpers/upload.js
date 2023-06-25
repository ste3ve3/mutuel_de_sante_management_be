import cloudinary from "./cloudinary.js";

const folder = "Magerwa VCC Images";

export const uploadToCloudinary = async (image) => {
  try {
    return await cloudinary.uploader.upload(image, {
      folder,
    });
  } catch (error) {
    const err = error.error?.toString();
    throw new Error(err?.split(": ")[2]?.split(",")[0] || err || error.message);
  }
};