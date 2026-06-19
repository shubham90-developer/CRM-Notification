import { NextFunction, Request, Response } from "express";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";
import { MenuMaster } from "./menuMaster.model";
import {
  menuMasterUpdateValidation,
  menuMasterValidation,
} from "./menuMaster.validation";

import { io } from "../../../server";
export const createMenuMaster = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { itemName, desc, priority, qty } = req.body || {};

    const image = req.file?.path;

    if (!image) {
      return next(new appError("Image is required", 400));
    }

    const existingMenuMaster = await MenuMaster.findOne({
      itemName,
      isDeleted: false,
    });

    if (existingMenuMaster) {
      return next(new appError("Menu already exists", 400));
    }

    const validatedData = menuMasterValidation.parse({
      itemName,
      desc,
      priority,
      qty,
      image,
    });

    const menuMaster = await MenuMaster.create(validatedData);

    console.log("STEP 1: Emit code reached");

    const room = io.sockets.adapter.rooms.get("kitchen-room");
    console.log("STEP 1: Room Size =", room?.size || 0);

    console.log("STEP 1: About to emit");

    io.to("kitchen-room").emit("new-menu-notification", {
      _id: menuMaster._id,
      itemName: menuMaster.itemName,
      image: menuMaster.image,
      priority: menuMaster.priority,
      qty: menuMaster.qty,
      desc: menuMaster.desc,
    });

    io.to("reception-room").emit("new-menu-notification", {
      _id: menuMaster._id,
      itemName: menuMaster.itemName,
      image: menuMaster.image,
      priority: menuMaster.priority,
      qty: menuMaster.qty,
      desc: menuMaster.desc,
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Menu created successfully",
      data: menuMaster,
    });
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split("/").pop()?.split(".")[0];

      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-categories/${publicId}`);
      }
    }

    next(error);
  }
};

export const getAllMenuMaster = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const menuMaster = await MenuMaster.find({
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        menuMaster.length > 0 ? "Menu retrieved successfully" : "No menu found",
      data: menuMaster,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuMasterById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const menuMaster = await MenuMaster.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!menuMaster) {
      next(new appError("Menu not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Category retrieved successfully",
      data: menuMaster,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateMenuMasterById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const menuMasterId = req.params.id;

    const menu = await MenuMaster.findOne({
      _id: menuMasterId,
      isDeleted: false,
    });

    if (!menu) {
      return next(new appError("Menu not found", 404));
    }

    const updateData: any = {};

    if (req.body.itemName) {
      updateData.itemName = req.body.itemName;
    }

    if (req.body.desc) {
      updateData.desc = req.body.desc;
    }

    if (req.body.priority) {
      updateData.priority = req.body.priority;
    }

    if (req.body.qty) {
      updateData.qty = req.body.qty;
    }

    // If image URL is being edited directly
    if (req.body.image) {
      updateData.image = req.body.image;
    }

    // If new file uploaded
    if (req.file) {
      updateData.image = req.file.path;

      if (menu.image) {
        const publicId = menu.image.split("/").pop()?.split(".")[0];

        if (publicId) {
          await cloudinary.uploader.destroy(
            `restaurant-categories/${publicId}`,
          );
        }
      }
    }

    const updatedMenu = await MenuMaster.findByIdAndUpdate(
      menuMasterId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Menu updated successfully",
      data: updatedMenu,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteMenuMasterById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const menuMaster = await MenuMaster.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );

    if (!menuMaster) {
      next(new appError("Menu not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Category deleted successfully",
      data: menuMaster,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateMenuStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "seen", "prepare", "ready"];
    if (!allowed.includes(status)) {
      return next(new appError("Invalid status value", 400));
    }

    const menu = await MenuMaster.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status },
      { new: true },
    );

    if (!menu) {
      return next(new appError("Menu not found", 404));
    }

    if (status === "prepare") {
      io.to("reception-room").emit("menu-status-updated", {
        _id: menu._id,
        itemName: menu.itemName,
        status: "prepare",
      });
    }
    if (status === "ready") {
      io.to("kitchen-room").emit("menu-status-updated", {
        _id: menu._id,
        itemName: menu.itemName,
        status: "ready",
      });
    }

    // NEW: global broadcast for anyone else watching (e.g. Admin Menu Master list)
    io.emit("menu-list-updated", { _id: menu._id, status: menu.status });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Menu status updated successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};
