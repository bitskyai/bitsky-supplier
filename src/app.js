/**
 * Created by Shaoke Xu on 5/5/18.
 */
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const logger = require("./util/logger");
const errorResponder = require("./middleware/error-responder");
const errorLogger = require("./middleware/error-logger");
const createRouters = require("./routers");
const { getConfig } = require("./config");
const security = require("./util/security");
const checkMigration = require("./migration");

async function createApp() {
  const app = express();
  logger.info("create app successful!");

  // App is served behind Heroku's router.
  // This is needed to be able to use req.ip or req.secure
  app.enable("trust proxy", 1);
  app.disable("x-powered-by");

  if (getConfig('NODE_ENV') !== "production") {
    app.use(morgan("dev"));
  }

  // Limit to 10mb if HTML has e.g. inline images
  app.use(
    bodyParser.text({
      limit: "4mb",
      type: "text/html"
    })
  );
  app.use(
    bodyParser.json({
      limit: "100mb"
    })
  );
  app.use(
    compression({
      // Compress everything over 10 bytes
      threshold: 10
    })
  );

  // Security check, if you don't want your server is public, then you can add `API_KEY` to protect your APIs
  app.use((req, res, next) => {
    if (security.verifyAPIKey(req, res)) {
      next();
    } else {
      logger.info("Invalid X-API-KEY");
    }
  });

  // serve static files
  app.use(express.static(path.join(__dirname + "/public")));

  // Check whether need to do data migration
  app.use((req, res, next) => {
    checkMigration(req, res, next);
  });

  await checkMigration();

  createRouters(app);

  app.use(errorLogger());
  app.use(errorResponder());

  // To support SPA
  app.get("*", (req, res, next) => {
    res.sendFile(path.join(__dirname + "/public/index.html"));
  });

  return app;
}

module.exports = createApp;
