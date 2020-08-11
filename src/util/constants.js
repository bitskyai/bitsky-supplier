const path = require('path');

const packageJson = require("../../package.json");

const CONFIG = {
  REQUESTED_WITH_ENGINE_UI: "engine-ui", // Request by engine-ui
  X_RESPONSED_WITH: "x-munew-responsed-with",
  X_REQUESTED_WITH: "x-munew-requested-with", // who send this request
  DIA_UI: "x_munew_dia_ui",
  X_SERIAL_ID: "x-munew-serial-id", // request serial id
  X_JOB_ID: "x-munew-job-id", // each request is a job
  X_SECURITY_KEY_HEADER: "x-munew-security-key", // This is an http request header, used for follow service to identify who send this request
  SECURITY_KEY_IN_DB: "securityKey",
  INTELLIGENCE_TIMEOUT_CHECK_TIME: 60*1000, // HOW frequently to check intelligence timeout
  TASK_JOB_TIMEOUT: 60*1000, // Timeout value for a task job
  SOI_STATE_CHECK_TIME: 10 * 1000, // How frequently to check SOI state
  TIMEOUT_VALUE_FOR_INTELLIGENCE: 5 * 60 * 1000,
  MAX_FAIL_NUMBER_FOR_INTELLIGENCE: 3, // Max fail number for an intelligence, if more then this fail number, this intelligence will be moved to history
  LOG_FILES_PATH: "./public/log",
  LOG_MAX_SIZE: 50*1024*1024, // 50MB
  ERROR_LOG_FILE_NAME: "error.log",
  COMBINED_LOG_FILE_NAME: "combined.log",
  NODE_ENV: "development",
  EACH_TIME_INTELLIGENCES_NUMBER: 1,
  SERVICE_NAME: packageJson.name,
  LOG_LEVEL: "info",
  PORT: 9099, // server port number
  MONGODB_URI: `mongodb://localhost:27017/${packageJson.name}`,
  DEFAULT_HEALTH_METHOD: "GET",
  DEFAULT_HEALTH_PATH: "/health",
  DEFAULT_INTELLIGENCES_METHOD: "POST",
  DEFAULT_INTELLIGENCES_PATH: "/apis/intelligences"
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
  sois: "sois",
  agents: "agents",
  intelligences: "intelligences",
  intelligencesHistory: "intelligences_history",
  serverInfo: "server_info",
  history: "history",
  log: "log",
  error: "error",
  unknownData: "unknown_data"
};

const INTELLIGENCE_STATE = {
  draft: "DRAFT",
  configured: "CONFIGURED",
  finished: "FINISHED",
  running: "RUNNING",
  failed: "FAILED",
  paused: "PAUSED",
  timeout: "TIMEOUT"
};

const AGENT_STATE = {
  draft: "DRAFT",
  configured: "CONFIGURED",
  active: "ACTIVE",
  deleted: "DELETED"
};

const SOI_STATE = {
  draft: "DRAFT",
  configured: "CONFIGURED",
  active: "ACTIVE",
  failed: "FAILED"
};

const PERMISSIONS = {
  public: "PUBLIC",
  private: "PRIVATE"
};

const DEFAULT_SOI = {
  name: `SOI ${Date.now()}`,
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
    path: "/apis/intelligences"
  }
};

const DEFAULT_INTELLIGENCE = {
  system: {
    state: "CONFIGURED",
    version: "1.0.0",
    failuresNumber: 0
  },
  type: "CRAWLER",
  permission: "PRIVATE",
  suitableAgents: ["BROWSEREXTENSION"],
  priority: 100
};

const DEFAULT_AGENT = {
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
  DEFAULT_SOI,
  INTELLIGENCE_STATE,
  AGENT_STATE,
  SOI_STATE,
  PERMISSIONS,
  DEFAULT_INTELLIGENCE,
  DEFAULT_AGENT,
  DEFAULT_DB_CONFIG,
  DEFAULT_SQLITE,
  DEFAULT_MONGODB
};
