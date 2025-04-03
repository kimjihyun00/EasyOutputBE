import { Request } from "express";
import { GoogleProfile } from "../../auth/dtos/google-profile";

export interface GoogleAuthenticatedRequest extends Request {
  user?: GoogleProfile;
}
