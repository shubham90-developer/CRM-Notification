import { Document } from "mongoose";

export interface IMenuMaster extends Document {
  itemName: string;
  status: "pending" | "seen" | "prepare" | "ready";
  image: string;
  desc: string;
  priority: string;
  qty: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
