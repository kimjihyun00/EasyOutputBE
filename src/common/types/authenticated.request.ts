import { UserPayload } from "../../auth/dtos/user-payload";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
