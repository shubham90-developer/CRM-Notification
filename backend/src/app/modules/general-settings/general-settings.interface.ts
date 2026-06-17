import { Document } from "mongoose";

export interface IGeneralSettings extends Document {
  logo?: string;
  username?: string;
  password?: string;
  notificationAudio?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
