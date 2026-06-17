import jwt from "jsonwebtoken";
import { IUser } from "../modules/auth/auth.model";
import { IRole } from "../modules/role/role.interface";

// Existing function — no changes, User flow untouched
export const generateToken = (user: IUser) => {
  const payload = {
    userId: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

// New function — for Role/staff users only
export const generateRoleToken = (role: IRole) => {
  const payload = {
    userId: role._id,
    name: role.employeeName,
    email: role.email,
    role: role.role,
    permissions: role.permissions,
    isRoleUser: true, // flag used in authMiddleware to separate the two flows
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};
