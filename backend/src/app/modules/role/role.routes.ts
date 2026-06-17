import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
  getAvailablePermissions,
  roleLogin, // NEW
} from "./role.controller";
import { auth } from "../../middlewares/authMiddleware";

import { requirePermission } from "../../middlewares/permissions";
const router = express.Router();

// Public — no auth needed
router.get("/permissions/available", getAvailablePermissions);

// NEW — Role/staff login (no auth needed)
router.post("/login", roleLogin);

// Only admin (from User model) can create, update, delete roles
router.post("/", createRole);
router.put("/:id", updateRoleById);
router.delete("/:id", auth("admin"), deleteRoleById);

// Admin OR staff with 'Roles' permission can view roles
router.get("/", auth(), requirePermission("Roles"), getAllRoles);
router.get("/:id", auth(), requirePermission("Roles"), getRoleById);

export const roleRouter = router;
