import auditService from "./auditService.js";
import * as institutionSettingService from "./institutionSettingService.js";
import * as holidayService from "./holidayService.js";

export const SettingsService = {
  log: auditService.log.bind(auditService),
  ...institutionSettingService,
  ...holidayService,
};

export default SettingsService;
