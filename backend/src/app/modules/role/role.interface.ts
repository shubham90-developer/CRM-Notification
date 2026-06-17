import { Document, Types } from 'mongoose';

export interface IRole extends Document {
  employeeId?: Types.ObjectId;
  employeeName?: string;
  role: string;
  email: string;
  password: string;
  permissions: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}
