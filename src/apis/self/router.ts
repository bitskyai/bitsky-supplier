const registeredPrivate = false;
const _ = require("lodash");
import { getServerInfo } from '../../dbController/ServerInformation.ctrl';
const { HTTPError } = require("../../util/error");

function registerRouter(router) {
  if (!registeredPrivate) {
    router.post("/self", [], async (req, res, next) => {
      try {
        // let info:any = await getServerInfo();
        const serverInfo: any = {};
        // serverInfo.securityKey = info.security_key;
        serverInfo.profile={
          name: 'Admin'
        }
        res.send(serverInfo);
      } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
          next(err);
        } else {
          // Otherwise create a HTTPError
          next(new HTTPError(500, err, {}, "00155000001"));
        }
      }
    });
  }
}

module.exports = registerRouter;
