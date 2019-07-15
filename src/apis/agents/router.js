let _registered = false;
const _ = require("lodash");
const helpers = require("./helpers");
const { HTTPError } = require("../../util/error");
const { CONFIG } = require("../../util/constants");

function registerRouter(router) {
  if (!_registered) {
    router.post("/agents", async (req, res, next) => {
      try {
        // TODO: need to improve how to handle security key
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let result = await helpers.registerAgent(_.get(req, "body"), securityKey);
        res.send(result);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "dia_00015000001"));
        }
      }
    });

    router.get("/agents", async (req, res, next) => {
      try {
        // TODO: need to improve how to handle security key
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let result = await helpers.getAgents(securityKey);
        res.send(result);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "dia_00025000001"));
        }
      }
    });

    router.get("/agents/:gid", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let result = await helpers.getAgent(
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
          next(new HTTPError(500, err, {}, "dia_00025000001"));
        }
      }
    });

    router.put("/agents/:gid", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        await helpers.updateAgent(
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
          next(new HTTPError(500, err, {}, "dia_00035000001"));
        }
      }
    });

    router.delete("/agents/:gid", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        await helpers.unregisterAgent(_.get(req, "params.gid"), securityKey);
        res.status(204).send();
      } catch (err) {
        // Already HTTPError, then throw its
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "dia_00045000001"));
        }
      }
    });

    // 0017
    router.post("/agents/:gid/activate", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let status = await helpers.activateAgent(_.get(req, "params.gid"), securityKey);
        res.json(status);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "dia_00035000001"));
        }
      }
    });

    // 0018
    router.post("/agents/:gid/deactivate", async (req, res, next) => {
      try {
        let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
        let status = await helpers.deactivateAgent(_.get(req, "params.gid"), securityKey);
        res.json(status);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "dia_00035000001"));
        }
      }
    });
  }
}

module.exports = registerRouter;
