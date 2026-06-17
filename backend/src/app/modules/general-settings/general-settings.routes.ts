import express from "express";
import { auth } from "../../middlewares/authMiddleware";
import {
  getGeneralSettings,
  updateGeneralSettings,
} from "./general-settings.controller";
import { upload, audioUpload } from "../../config/cloudinary";
import multer from "multer";

const router = express.Router();

// Combine image + audio upload in one middleware using multer fields
const uploadFields = multer({
  storage: (upload as any).storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const imageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    const audioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
    if (
      imageTypes.includes(file.mimetype) ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype === "video/mpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image or audio files are allowed"));
    }
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "notificationAudio", maxCount: 1 },
]);

router.get("/", getGeneralSettings);
router.put("/", uploadFields, updateGeneralSettings);

export const generalSettingsRouter = router;
