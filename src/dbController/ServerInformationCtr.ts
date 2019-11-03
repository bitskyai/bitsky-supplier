import { getRepository } from "typeorm";
import ServerInformation from "../entity/ServerInformation";
const logger = require('../util/logger');

export async function getServerInfo() {
  try {
    const serverInfoRepo = getRepository(ServerInformation);
    const serverInfo = await serverInfoRepo.find();
    logger.debug("[getServerInfo], serverInfo: %o", serverInfo);
    return serverInfo&&serverInfo[0];
  } catch (err) {
    logger.error('getServerInfo, err:', err);
    throw err;
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
    await serverInfoRepo.save(serverInfo);
    logger.debug("[addServerInfo], serverInfo: %o", serverInfo);
    return serverInfo;
  } catch (err) {
    logger.error('addServerInfo, err:', err);
    throw err;
  }
}

export async function updateServerInfo(globalId:string, serverInfo:object){
  try{
    const serverInfoRepo = getRepository(ServerInformation);
    const result = await serverInfoRepo.update({global_id: globalId}, serverInfo);
    logger.debug("[updateServerInfo], result: %o", result);
    return result;
  }catch(err){
    logger.error('updateServerInfo, err:', err);
    throw err;
  }
}
