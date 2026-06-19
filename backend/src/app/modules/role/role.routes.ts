import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
  getAvailablePermissions,
  roleLogin,
  getRoleMe,
} from "./role.controller";
import { auth } from "../../middlewares/authMiddleware";
import { requirePermission } from "../../middlewares/permissions";

const router = express.Router();

// Public — no auth needed
router.get("/permissions/available", getAvailablePermissions);
router.post("/login", roleLogin);
router.get("/me", getRoleMe);

// CRUD
router.post("/", createRole);
router.get("/", auth(), requirePermission("Roles"), getAllRoles);
router.get("/:id", auth(), requirePermission("Roles"), getRoleById);
router.put("/:id", updateRoleById);
router.delete("/:id", auth("admin"), deleteRoleById);

export const roleRouter = router;
