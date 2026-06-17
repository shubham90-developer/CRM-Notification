import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { GeneralSettings } from "./general-settings.model";
import { generalSettingsValidation } from "./general-settings.validation";

export const getGeneralSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let settings = await GeneralSettings.findOne();
    if (!settings) {
      settings = await GeneralSettings.create({});
    }
    res.json({
      success: true,
      statusCode: 200,
      message: "General settings retrieved successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGeneralSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload: Record<string, any> = { ...(req.body || {}) };

    // If logo file uploaded
    if ((req.files as any)?.logo?.[0]) {
      payload.logo = (req.files as any).logo[0].path;
    }

    // If audio file uploaded — Cloudinary returns the URL in file.path
    if ((req.files as any)?.notificationAudio?.[0]) {
      payload.notificationAudio = (req.files as any).notificationAudio[0].path;
    }

    const validated = generalSettingsValidation.parse(payload);

    const update: Record<string, any> = {};
    if (validated.logo !== undefined) update.logo = validated.logo;
    if (validated.username !== undefined) update.username = validated.username;
    if (validated.notificationAudio !== undefined)
      update.notificationAudio = validated.notificationAudio;

    if (validated.changePassword) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(validated.changePassword, salt);
    }

    let settings = await GeneralSettings.findOne();
    if (!settings) {
      settings = await GeneralSettings.create(update);
    } else {
      Object.assign(settings, update);
      await settings.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "General settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
