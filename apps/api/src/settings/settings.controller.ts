import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";

import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { SettingsService } from "./settings.service";

@Controller("user-settings")
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Req() request: AuthenticatedRequest) {
    const settings = await this.settingsService.getUserSettings(
      request.user?.username ?? ""
    );
    return { success: true, data: settings };
  }

  @Put()
  async saveSettings(
    @Req() request: AuthenticatedRequest,
    @Body() body: { settings?: unknown }
  ) {
    const settings = await this.settingsService.saveUserSettings(
      request.user?.username ?? "",
      body.settings
    );
    return { success: true, data: settings };
  }
}
