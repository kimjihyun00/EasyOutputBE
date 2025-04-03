import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP", { timestamp: true });

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get("user-agent") || "";
    this.logger.log(`Request ${method} ${originalUrl} - ${userAgent} ${ip}`);

    res.on("finish", () => {
      const { statusCode } = res;
      const contentLength = res.get("content-length");

      this.logger.log(
        `Response ${method} ${originalUrl} - ${statusCode} - ${contentLength} `,
      );
    });

    next();
  }
}
