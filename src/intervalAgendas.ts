import {
  updateTimeoutTasks,
  checkRetailerServicesHealth,
  removeTimeoutTaskJob
} from "./apis/agendas/helpers";
const { getConfig } = require("./config");
const logger = require("./util/logger");
let __updateTimeoutTasksIntervalHandler = null;
let __checkRetailerServicesHealthIntervalHandler = null;
let __removeTimeoutTaskJobIntervalHandler = null;

export async function setupIntervalAgendas() {
  try {
    await updateTimeoutTasks();
    await checkRetailerServicesHealth();
    await removeTimeoutTaskJob();
    clearInterval(__updateTimeoutTasksIntervalHandler);
    clearInterval(__checkRetailerServicesHealthIntervalHandler);
    clearInterval(__removeTimeoutTaskJobIntervalHandler);
    const taskTimeout = getConfig("TASK_TIMEOUT_CHECK_TIME");
    const intervalCheckAS = getConfig("RETAILER_STATE_CHECK_TIME");
    const timeoutCreatedAt = getConfig("TASK_JOB_TIMEOUT")*0.2;
    __updateTimeoutTasksIntervalHandler = setInterval(() => {
      logger.info("start updateTimeoutTasks ... ", {
        function: "setupIntervalAgendas",
        taskTimeout,
      });
      updateTimeoutTasks();
    }, taskTimeout);

    __checkRetailerServicesHealthIntervalHandler = setInterval(() => {
      logger.info("start checkRetailerServicesHealth ... ", {
        function: "setupIntervalAgendas",
        taskTimeout,
      });
      checkRetailerServicesHealth();
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
      taskTimeout,
      intervalCheckAS,
    });
  } catch (err) {
    logger.error(`setupIntervalAgendas fail. Error: ${err.message}`, {
      function: "setupIntervalAgendas",
      error: err,
    });
  }
}
