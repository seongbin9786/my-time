import { BadRequestException, Injectable } from "@nestjs/common";

import { SettingsRepository, UserSettings } from "./settings.repository";

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  getUserSettings(username: string): Promise<UserSettings> {
    return this.settingsRepository.getUserSettings(username);
  }

  saveUserSettings(username: string, settings: unknown): Promise<UserSettings> {
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      throw new BadRequestException("settings object is required");
    }

    return this.settingsRepository.saveUserSettings(username, settings);
  }
}
