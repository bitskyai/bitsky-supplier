let _registered = false;
const _ = require("lodash");
const helpers = require("./helpers");
const { HTTPError } = require("../../util/error");
const { CONFIG } = require("../../util/constants");

function registerRouter(router) {
  if (!_registered) {
    router.post("/sois", async (req, res, next) => {
      try {
        // TODO: need to improve how to handle security key
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let result = await helpers.registerSOI(_.get(req, "body"), securityKey);
        res.send(result);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "00015000001"));
        }
      }
    });

    router.get("/sois", async (req, res, next) => {
      try {
        // TODO: need to improve how to handle security key
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let result = await helpers.getSOIs(securityKey);
        res.send(result);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "00025000001"));
        }
      }
    });

    router.get("/sois/:gid", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let result = await helpers.getSOI(
          _.get(req, "params.gid"),
          securityKey
        );
        res.send(result);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "00025000001"));
        }
      }
    });

    router.put("/sois/:gid", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        await helpers.updateSOI(
          _.get(req, "params.gid"),
          _.get(req, "body"),
          securityKey
        );
        res.status(204).send();
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "00035000001"));
        }
      }
    });

    router.delete("/sois/:gid", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        await helpers.unregisterSOI(_.get(req, "params.gid"), securityKey);
        res.status(204).send();
      } catch (err) {
        // Already HTTPError, then throw its
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "00045000001"));
        }
      }
    });

    router.put("/sois/:gid/status", async (req, res, next) => {
      try {
        let status = await helpers.updateSOIState(_.get(req, "params.gid"));
        res.json(status);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "00035000001"));
        }
      }
    });
  }
}

module.exports = registerRouter;
