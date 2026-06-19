import { NextFunction, Request, Response } from "express";
import { Role } from "./role.model";
import { roleValidation, roleUpdateValidation } from "./role.validation";
import { appError } from "../../errors/appError";
import { generateRoleToken } from "../../config/generateToken"; // NEW import

export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = roleValidation.parse(req.body);

    const existing = await Role.findOne({
      email: validated.email,
      isDeleted: false,
    });
    if (existing) {
      next(new appError("Role with this email already exists", 400));
      return;
    }

    const role = new Role(validated);
    await role.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      search,
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;
    const filter: Record<string, any> = { isDeleted: false };
    if (search) {
      const rx = new RegExp(search, "i");
      filter.$or = [{ role: rx }, { email: rx }, { employeeName: rx }];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [roles, total] = await Promise.all([
      Role.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Role.countDocuments(filter),
    ]);

    res.json({
      success: true,
      statusCode: 200,
      message: "Roles retrieved successfully",
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) {
      next(new appError("Role not found", 404));
      return;
    }
    res.json({
      success: true,
      statusCode: 200,
      message: "Role retrieved successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) {
      next(new appError("Role not found", 404));
      return;
    }

    const validated = roleUpdateValidation.parse(req.body);

    if (validated.email && validated.email !== role.email) {
      const existing = await Role.findOne({
        email: validated.email,
        isDeleted: false,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        next(new appError("Role with this email already exists", 400));
        return;
      }
    }

    Object.assign(role, validated);
    await role.save();

    res.json({
      success: true,
      statusCode: 200,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!role) {
      next(new appError("Role not found", 404));
      return;
    }
    res.json({
      success: true,
      statusCode: 200,
      message: "Role deleted successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailablePermissions = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permissions = [
      "Dashboard",
      "All Projects",
      "Edit Projects",
      "Delete Projects",
      "My Work",
      "Edit Work",
      "Delete Work",
      "Calendar",
      "My Note",
      "Core Team",
      "Edit Team",
      "Delete Team",
      "Reports",
      "Roles",
      "Collections",
      "Settings",
      "Invoices",
      "Project Credentials",
    ];
    res.json({
      success: true,
      statusCode: 200,
      message: "Available permissions retrieved successfully",
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged-in role user from token
export const getRoleMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next(new appError("No token provided", 401));
      return;
    }

    const token = authHeader.split(" ")[1];

    const jwt = await import("jsonwebtoken");
    const decoded: any = jwt.default.verify(
      token,
      process.env.JWT_SECRET as string,
    );

    const role = await Role.findOne({ _id: decoded.userId, isDeleted: false });
    if (!role) {
      next(new appError("Role user not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Role user retrieved successfully",
      token,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};
// NEW — Login endpoint for Role/staff users
export const roleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      next(new appError("Email and password are required", 400));
      return;
    }

    const role = await Role.findOne({ email, isDeleted: false });

    // Plain-text comparison (as per your role model design)
    if (!role || role.password !== password) {
      next(new appError("Invalid email or password", 401));
      return;
    }

    const token = generateRoleToken(role);

    res.json({
      success: true,
      statusCode: 200,
      message: "Login successful",
      token,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};
