import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../modules/auth/auth.model";
import { Role } from "../modules/role/role.model"; // NEW import
import { userInterface } from "./userInterface";
import { appError } from "../errors/appError";

export const auth = (...requiredRoles: string[]) => {
  return async (req: userInterface, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return next(
          new appError("Authentication required. No token provided", 401),
        );
      }

      // Decode token — now includes isRoleUser and permissions fields
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        isRoleUser?: boolean;
        permissions?: string[];
      };

      let user: any;

      if (decoded.isRoleUser) {
        // --- Role/staff user flow (NEW) ---
        user = await Role.findOne({ _id: decoded.userId, isDeleted: false });
        if (user) {
          // Attach permissions from token directly so requirePermission middleware can use them
          user.permissions = decoded.permissions ?? [];
        }
      } else {
        // --- Regular User flow (UNCHANGED) ---
        user = await User.findById(decoded.userId);
      }

      if (!user) {
        return next(new appError("User not found", 401));
      }

      req.user = user;

      // Role-based authorization (existing behaviour preserved)
      // Admin from User model always passes; Role users are checked by requirePermission separately
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return next(
          new appError(
            "You do not have permission to perform this action",
            403,
          ),
        );
      }

      next();
    } catch (error) {
      next(new appError("Invalid or expired token", 401));
    }
  };
};

// Existing optionalAuth — no changes needed
export const optionalAuth = () => {
  return async (req: userInterface, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        req.user = undefined;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user: any = await User.findById(decoded.userId);

      if (user) {
        req.user = user;
      }

      next();
    } catch (error) {
      req.user = undefined;
      next();
    }
  };
};
