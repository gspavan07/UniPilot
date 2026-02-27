import * as feeAnalyticsService from "./feeAnalyticsService.js";
import * as feeLedgerService from "./feeLedgerService.js";
import * as feeStatusService from "./feeStatusService.js";
import * as feePaymentService from "./feePaymentService.js";

export const FeesService = {
  ...feeAnalyticsService,
  ...feeLedgerService,
  ...feeStatusService,
  ...feePaymentService,
};

export default FeesService;
