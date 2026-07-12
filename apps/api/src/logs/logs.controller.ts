import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { LogsService, SaveLogRequest } from "./logs.service";

@Controller("raw-logs")
@UseGuards(AuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getAllLogs(@Req() request: AuthenticatedRequest) {
    const logs = await this.logsService.getAllLogs(
      request.user?.username ?? ""
    );
    return { data: logs };
  }

  @Post()
  async saveLog(
    @Req() request: AuthenticatedRequest,
    @Body() body: SaveLogRequest
  ) {
    this.assertLogBody(body);
    return this.logsService.saveLog(request.user?.username ?? "", body);
  }

  @Post("bulk")
  async bulkSaveLogs(
    @Req() request: AuthenticatedRequest,
    @Body() body: { logs?: SaveLogRequest[] }
  ) {
    if (!Array.isArray(body.logs)) {
      throw new BadRequestException("logs array is required");
    }

    for (const log of body.logs) {
      this.assertLogBody(log);
    }

    return this.logsService.bulkSaveLogs(
      request.user?.username ?? "",
      body.logs
    );
  }

  @Get(":date")
  async getLog(
    @Req() request: AuthenticatedRequest,
    @Param("date") date: string
  ) {
    const log = await this.logsService.getLog(
      request.user?.username ?? "",
      date
    );
    return log ?? { date, content: "" };
  }

  @Get(":date/backups")
  async getLogBackups(
    @Req() request: AuthenticatedRequest,
    @Param("date") date: string
  ) {
    const backups = await this.logsService.getLogBackups(
      request.user?.username ?? "",
      date
    );
    return { data: backups };
  }

  private assertLogBody(body: SaveLogRequest): void {
    if (!body?.date) {
      throw new BadRequestException("Date is required");
    }
  }
}
