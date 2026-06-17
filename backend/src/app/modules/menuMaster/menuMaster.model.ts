import mongoose, { Schema } from "mongoose";
import { IMenuMaster } from "./menuMaster.interface";

const menuMasterSchema: Schema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
    },

    desc: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical", "urgent"],
      default: "medium",
      lowercase: true,
      trim: true,
    },

    qty: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "seen", "prepare", "ready"],
      default: "pending",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });

        ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });

        return ret;
      },
    },
  },
);

export const MenuMaster = mongoose.model<IMenuMaster>(
  "MenuMaster",
  menuMasterSchema,
);
