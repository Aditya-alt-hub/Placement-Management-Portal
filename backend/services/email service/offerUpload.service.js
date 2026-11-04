import cloudinary from "../../utils/cloudinary.js";
export const uploadOfferLetter = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "placement-portal/offer-letters",
        resource_type: "raw",
        format: "pdf",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
};
