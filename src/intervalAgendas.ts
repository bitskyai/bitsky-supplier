import {
  updateTimeoutIntelligences,
  checkAnalystServicesHealth,
  removeTimeoutTaskJob
} from "./apis/agendas/helpers";
const { getConfig } = require("./config");
const logger = require("./util/logger");
let __updateTimeoutIntelligencesIntervalHandler = null;
let __checkAnalystServicesHealthIntervalHandler = null;
let __removeTimeoutTaskJobIntervalHandler = null;

export async function setupIntervalAgendas() {
  try {
    await updateTimeoutIntelligences();
    await checkAnalystServicesHealth();
    await removeTimeoutTaskJob();
    clearInterval(__updateTimeoutIntelligencesIntervalHandler);
    clearInterval(__checkAnalystServicesHealthIntervalHandler);
    clearInterval(__removeTimeoutTaskJobIntervalHandler);
    const intelligenceTimeout = getConfig("INTELLIGENCE_TIMEOUT_CHECK_TIME");
    const intervalCheckAS = getConfig("SOI_STATE_CHECK_TIME");
    const timeoutCreatedAt = getConfig("TASK_JOB_TIMEOUT")*0.2;
    __updateTimeoutIntelligencesIntervalHandler = setInterval(() => {
      logger.info("start updateTimeoutIntelligences ... ", {
        function: "setupIntervalAgendas",
        intelligenceTimeout,
      });
      updateTimeoutIntelligences();
    }, intelligenceTimeout);

    __checkAnalystServicesHealthIntervalHandler = setInterval(() => {
      logger.info("start checkAnalystServicesHealth ... ", {
        function: "setupIntervalAgendas",
        intelligenceTimeout,
      });
      checkAnalystServicesHealth();
    }, intervalCheckAS);

    __removeTimeoutTaskJobIntervalHandler = setInterval(() => {
      logger.info("start removeTimeoutTaskJob ... ", {
        function: "setupIntervalAgendas",
        timeoutCreatedAt,
      });
      removeTimeoutTaskJob();
    }, timeoutCreatedAt);

    logger.info("successful setupIntervalAgendas", {
      function: "setupIntervalAgendas",
      intelligenceTimeout,
      intervalCheckAS,
    });
  } catch (err) {
    logger.error(`setupIntervalAgendas fail. Error: ${err.message}`, {
      function: "setupIntervalAgendas",
      error: err,
    });
  }
}
