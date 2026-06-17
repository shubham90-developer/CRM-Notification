import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    let folder = "uploads";

    if (req.originalUrl.includes("/menu-category")) {
      folder = "menu-category";
    }

    // Audio upload for notification settings
    if (
      req.originalUrl.includes("/general-settings") &&
      (file.mimetype.startsWith("audio/") || file.mimetype === "video/mpeg")
    ) {
      return {
        folder: "notification-audio",
        resource_type: "video", // Cloudinary uses "video" for audio files
        public_id: `${file.originalname.split(".")[0].replace(/\s+/g, "-")}-${Date.now()}`,
        // ✅ No format field — Cloudinary auto-detects from file
      };
    }

    return {
      folder,
      format: file.mimetype.split("/")[1],
      transformation: [{ width: 1200, height: 600, crop: "limit" }],
      public_id: `${Date.now()}-${file.originalname.split(".")[0].replace(/\s+/g, "-")}`,
    };
  },
});

// Image upload (existing)
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Audio upload (new — for notification sound) — allows ALL audio extensions
export const audioUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const isAudio =
      file.mimetype.startsWith("audio/") || file.mimetype === "video/mpeg";
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    const allowedExts = [
      "mp3",
      "wav",
      "ogg",
      "aac",
      "flac",
      "mpeg",
      "mp4a",
      "weba",
    ];

    if (isAudio || allowedExts.includes(ext!)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

export { cloudinary };
