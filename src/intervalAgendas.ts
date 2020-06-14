import {
  updateTimeoutIntelligences,
  checkAnalystServicesHealth,
} from "./apis/agendas/helpers";
const { getConfig } = require("./config");
const logger = require("./util/logger");
let __updateTimeoutIntelligencesIntervalHandler = null;
let __checkAnalystServicesHealthIntervalHandler = null;

export async function setupIntervalAgendas() {
  try {
    await updateTimeoutIntelligences();
    await checkAnalystServicesHealth();
    clearInterval(__updateTimeoutIntelligencesIntervalHandler);
    clearInterval(__checkAnalystServicesHealthIntervalHandler);
    const intelligenceTimeout = getConfig("INTELLIGENCE_TIMEOUT_CHECK_TIME");
    const intervalCheckAS = getConfig("SOI_STATE_CHECK_TIME");
    __updateTimeoutIntelligencesIntervalHandler = setInterval(() => {
      logger.info("start updateTimeoutIntelligences ... ", {
        fun: "setupIntervalAgendas",
        intelligenceTimeout,
      });
      updateTimeoutIntelligences();
    }, intelligenceTimeout);

    __checkAnalystServicesHealthIntervalHandler = setInterval(() => {
      logger.info("start checkAnalystServicesHealth ... ", {
        fun: "setupIntervalAgendas",
        intelligenceTimeout,
      });
      checkAnalystServicesHealth();
    }, intervalCheckAS);
    logger.info("successful setupIntervalAgendas", {
      fun: "setupIntervalAgendas",
      intelligenceTimeout,
      intervalCheckAS,
    });
  } catch (err) {
    logger.error(`setupIntervalAgendas fail. Error: ${err.message}`, {
      fun: "setupIntervalAgendas",
      error: err,
    });
  }
}
