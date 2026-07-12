import { Injectable } from "@nestjs/common";

import { PrismaService } from "../db/prisma.service";

export type UserSettings = Partial<
  Record<"app-theme" | "app-theme-by-scheme", string>
>;

const USER_SETTING_KEYS = ["app-theme", "app-theme-by-scheme"] as const;

export const sanitizeUserSettings = (value: unknown): UserSettings => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const settings = value as Record<string, unknown>;
  const sanitized: UserSettings = {};

  for (const key of USER_SETTING_KEYS) {
    const rawValue = settings[key];
    if (typeof rawValue === "string") {
      sanitized[key] = rawValue;
    }
  }

  return sanitized;
};

@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSettings(username: string): Promise<UserSettings> {
    const row = await this.prisma.userSettings.findUnique({
      where: { username },
      select: { appTheme: true, appThemeByScheme: true },
    });
    if (!row) return {};

    return {
      ...(row.appTheme ? { "app-theme": row.appTheme } : {}),
      ...(row.appThemeByScheme
        ? { "app-theme-by-scheme": row.appThemeByScheme }
        : {}),
    };
  }

  async saveUserSettings(
    username: string,
    settings: unknown
  ): Promise<UserSettings> {
    const sanitizedInput = sanitizeUserSettings(settings);
    const currentSettings = await this.getUserSettings(username);
    const mergedSettings = {
      ...currentSettings,
      ...sanitizedInput,
    };

    await this.prisma.userSettings.upsert({
      where: { username },
      create: {
        username,
        appTheme: mergedSettings["app-theme"] ?? null,
        appThemeByScheme: mergedSettings["app-theme-by-scheme"] ?? null,
      },
      update: {
        appTheme: mergedSettings["app-theme"] ?? null,
        appThemeByScheme: mergedSettings["app-theme-by-scheme"] ?? null,
      },
    });

    return mergedSettings;
  }
}
