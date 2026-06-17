import express from "express";
import {
  createMenuMaster,
  deleteMenuMasterById,
  getAllMenuMaster,
  getMenuMasterById,
  updateMenuMasterById,
  updateMenuStatus,
} from "./meneuMaster.controller";
import { upload } from "../../config/cloudinary";

const router = express.Router();

router.post(
  "/",
  upload.single("image"),
  (req, res, next) => {
    console.log("CREATE MENU ROUTE HIT");
    next();
  },
  createMenuMaster,
);

router.get("/", getAllMenuMaster);

router.get("/:id", getMenuMasterById);

router.put("/:id", upload.single("image"), updateMenuMasterById);

router.delete("/:id", deleteMenuMasterById);

router.patch("/:id/status", updateMenuStatus);
export const menuMasterRouter = router;
