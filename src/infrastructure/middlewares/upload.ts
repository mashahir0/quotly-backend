import multer from 'multer'
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudnary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: "profile_pictures", // ✅ Now TypeScript accepts it
        format: "png", // Ensure format is provided
        public_id: file.originalname.split(".")[0], // Optional: Use file name
      };
    },
  });
  

const upload = multer({ storage });

export default upload;
