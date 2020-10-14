import { getRepository } from "typeorm";
const uuidv4 = require('uuid/v4');
import ServerInformation from "../entity/ServerInformation";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

export async function getServerInfo() {
  try {
    const serverInfoRepo = getRepository(ServerInformation);

    const serverInfo = await serverInfoRepo.find({});
    logger.debug("[getServerInfo], serverInfo: %o", serverInfo);
    return serverInfo && serverInfo[0];
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "ServerInformationCtr->getServerInfo"
    );
    logger.error("getServerInfo, error:", error);
    throw error;
  }
}

export async function addServerInfo(
  name: string,
  description: string,
  version: string,
  migrationVersion: number
) {
  try {
    const serverInfoRepo = getRepository(ServerInformation);
    let serverInfo = new ServerInformation();
    serverInfo.name = name;
    serverInfo.description = description;
    serverInfo.version = version;
    serverInfo.migration_version = migrationVersion;
    serverInfo.security_key = uuidv4();
    await serverInfoRepo.save(serverInfo);
    logger.debug("[addServerInfo], serverInfo: %o", serverInfo);
    return serverInfo;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "ServerInformationCtr->addServerInfo"
    );
    logger.error("addServerInfo, error:", error);
    throw err;
  }
}

export async function updateServerInfo(globalId: string, serverInfo: object) {
  try {
    const serverInfoRepo = getRepository(ServerInformation);
    const result = await serverInfoRepo.update(
      { global_id: globalId },
      serverInfo
    );
    logger.debug("[updateServerInfo], result: %o", result);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "ServerInformationCtr->updateServerInfo"
    );
    logger.error("updateServerInfo, error:", error);
    throw err;
  }
}
