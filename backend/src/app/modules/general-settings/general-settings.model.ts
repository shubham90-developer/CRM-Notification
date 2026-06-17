import mongoose, { Schema } from "mongoose";
import { IGeneralSettings } from "./general-settings.interface";

const GeneralSettingsSchema: Schema = new Schema(
  {
    logo: { type: String, default: "" },
    username: { type: String, default: "", trim: true },
    password: { type: String, default: "", select: false },
    notificationAudio: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        delete ret.password;
        if (ret.createdAt)
          ret.createdAt = new Date(ret.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          });
        if (ret.updatedAt)
          ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          });
      },
    },
  },
);

export const GeneralSettings = mongoose.model<IGeneralSettings>(
  "GeneralSettings",
  GeneralSettingsSchema,
);
