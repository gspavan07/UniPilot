import { InstitutionSetting } from "../models/index.js";

const GLOBAL_SETTING_KEY = "global_config";

export const getGlobalConfig = async ({ transaction, lock = false } = {}) =>
  InstitutionSetting.findOne({
    where: { setting_key: GLOBAL_SETTING_KEY },
    transaction,
    lock: lock && transaction ? true : undefined,
  });

export const getOrCreateGlobalConfig = async ({
  transaction,
  defaults = {},
} = {}) => {
  let setting = await getGlobalConfig({ transaction, lock: true });

  if (!setting) {
    setting = await InstitutionSetting.create(
      {
        setting_key: GLOBAL_SETTING_KEY,
        setting_value: "{}",
        current_admission_sequence: 1,
        admission_number_prefix: "ADM",
        ...defaults,
      },
      { transaction },
    );
  }

  return setting;
};

export default {
  getGlobalConfig,
  getOrCreateGlobalConfig,
};
