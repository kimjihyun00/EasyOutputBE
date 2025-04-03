import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger("PrismaClient", {
    timestamp: true,
  });

  constructor() {
    super({
      errorFormat: "pretty",
      log: [
        {
          emit: "event",
          level: "query",
        },
        {
          emit: "stdout",
          level: "error",
        },
        {
          emit: "stdout",
          level: "info",
        },
        {
          emit: "stdout",
          level: "warn",
        },
      ],
    });

    this.$on("query" as never, (event: Prisma.QueryEvent) => {
      this.logger.log("Query: " + event.query);
      this.logger.log("Params: " + event.params);
      this.logger.log("Duration: " + event.duration + "ms");
    });
  }

  async onModuleInit(): Promise<any> {
    await this.$connect();
  }
}
