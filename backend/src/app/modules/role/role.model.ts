import mongoose, { Schema } from "mongoose";
import { IRole } from "./role.interface";

const RoleSchema: Schema = new Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" },
    employeeName: { type: String, default: "", trim: true },
    role: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    permissions: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        // NOTE: password is intentionally returned in plain text by request,
        // so the admin panel can display the credentials it created.
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

// Plain-text password compare (no hashing) – for internal admin-managed credentials only.
RoleSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return this.password === password;
};

export const Role = mongoose.model<IRole>("Role", RoleSchema);
