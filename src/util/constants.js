const path = require('path');

const packageJson = require("../../package.json");

const CONFIG = {
  REQUESTED_WITH_ENGINE_UI: "bitsky-ui", // Request by bitsky-ui
  X_RESPONSED_WITH: "x-bitsky-responsed-with",
  X_REQUESTED_WITH: "x-bitsky-requested-with", // who send this request
  DIA_UI: "x_bitsky_dia_ui",
  X_SERIAL_ID: "x-bitsky-serial-id", // request serial id
  X_JOB_ID: "x-bitsky-job-id", // each request is a job
  X_SECURITY_KEY_HEADER: "x-bitsky-security-key", // This is an http request header, used for follow service to identify who send this request
  SECURITY_KEY_IN_DB: "securityKey",
  TASK_TIMEOUT_CHECK_TIME: 60*1000, // HOW frequently to check task timeout
  TASK_JOB_TIMEOUT: 60*1000, // Timeout value for a task job
  RETAILER_STATE_CHECK_TIME: 10 * 1000, // How frequently to check Retailer state
  TIMEOUT_VALUE_FOR_TASK: 5 * 60 * 1000,
  MAX_FAIL_NUMBER_FOR_TASK: 3, // Max fail number for an task, if more then this fail number, this task will be moved to history
  LOG_FILES_PATH: "./public/log",
  LOG_MAX_SIZE: 50*1024*1024, // 50MB
  ERROR_LOG_FILE_NAME: "error.log",
  COMBINED_LOG_FILE_NAME: "combined.log",
  NODE_ENV: "development",
  EACH_TIME_TASKS_NUMBER: 1,
  SERVICE_NAME: packageJson.name,
  LOG_LEVEL: "info",
  PORT: 9099, // server port number
  MONGODB_URI: `mongodb://localhost:27017/${packageJson.name}`,
  DEFAULT_HEALTH_METHOD: "GET",
  DEFAULT_HEALTH_PATH: "/health",
  DEFAULT_TASKS_METHOD: "POST",
  DEFAULT_TASKS_PATH: "/apis/tasks"
};

const DEFAULT_DB_CONFIG = {
  autoSave: true,
  logging: true,
  autoSchemaSync: true,
  synchronize: true,
  entities: [],
  // migrations: ["./migration/**/*.ts"],
  subscribers: []
};

const DEFAULT_SQLITE = {
  type: "sqlite",
  database: `${packageJson.name}.sql`
};

const DEFAULT_MONGODB = {
  type: "mongodb",
  url: `mongodb://localhost:27017/${packageJson.name}`,
};

const COLLECTIONS_NAME = {
  retailers: "retailers",
  producers: "producers",
  tasks: "tasks",
  tasksHistory: "tasks_history",
  serverInfo: "server_info",
  history: "history",
  log: "log",
  error: "error",
  unknownData: "unknown_data"
};

const TASK_STATE = {
  draft: "DRAFT",
  configured: "CONFIGURED",
  finished: "FINISHED",
  running: "RUNNING",
  failed: "FAILED",
  paused: "PAUSED",
  timeout: "TIMEOUT"
};

const PRODUCER_STATE = {
  draft: "DRAFT",
  configured: "CONFIGURED",
  active: "ACTIVE",
  deleted: "DELETED"
};

const RETAILER_STATE = {
  draft: "DRAFT",
  configured: "CONFIGURED",
  active: "ACTIVE",
  failed: "FAILED"
};

const PERMISSIONS = {
  public: "PUBLIC",
  private: "PRIVATE"
};

const DEFAULT_RETAILER = {
  name: `Retailer ${Date.now()}`,
  system: {
    state: "FAILED",
    version: "1.0.0"
  },
  health: {
    method: "GET",
    path: "/health"
  },
  callback: {
    method: "POST",
    path: "/apis/tasks"
  }
};

const DEFAULT_TASK = {
  system: {
    state: "CONFIGURED",
    version: "1.0.0",
    failuresNumber: 0
  },
  type: "CRAWLER",
  permission: "PRIVATE",
  suitableProducers: ["HEADLESSBROWSER"],
  priority: 100
};

const DEFAULT_PRODUCER = {
  system: {
    version: "1.0.0",
    state: "DRAFT"
  },
  permission: "PRIVATE",
  concurrent: 1,
  maxWaitingTime: 5,
  idelTime: 0,
  timeout: 90,
  maxRetry: 3
};

module.exports = {
  CONFIG,
  COLLECTIONS_NAME,
  DEFAULT_RETAILER,
  TASK_STATE,
  PRODUCER_STATE,
  RETAILER_STATE,
  PERMISSIONS,
  DEFAULT_TASK,
  DEFAULT_PRODUCER,
  DEFAULT_DB_CONFIG,
  DEFAULT_SQLITE,
  DEFAULT_MONGODB
};
