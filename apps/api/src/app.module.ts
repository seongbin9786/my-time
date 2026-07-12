import { Module } from "@nestjs/common";

import { AuthController } from "./auth/auth.controller";
import { AuthGuard } from "./auth/auth.guard";
import { AuthService } from "./auth/auth.service";
import { PrismaService } from "./db/prisma.service";
import { LogsController } from "./logs/logs.controller";
import { LOGS_REPOSITORY, PrismaLogsRepository } from "./logs/logs.repository";
import { LogsService } from "./logs/logs.service";
import { SettingsController } from "./settings/settings.controller";
import { SettingsRepository } from "./settings/settings.repository";
import { SettingsService } from "./settings/settings.service";
import { UsersRepository } from "./users/users.repository";

@Module({
  controllers: [AuthController, SettingsController, LogsController],
  providers: [
    PrismaService,
    UsersRepository,
    AuthService,
    AuthGuard,
    SettingsRepository,
    SettingsService,
    LogsService,
    {
      provide: LOGS_REPOSITORY,
      useClass: PrismaLogsRepository,
    },
  ],
})
export class AppModule {}
