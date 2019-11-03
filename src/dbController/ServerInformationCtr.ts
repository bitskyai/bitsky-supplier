import { getRepository } from "typeorm";
import ServerInformation from "../entity/ServerInformation";

export async function getServerInfo() {
  try {
    const serverInfoRepo = getRepository(ServerInformation);
    const serverInfo = await serverInfoRepo.find({});
    return serverInfo&&serverInfo[0];
  } catch (err) {
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
    return serverInfo;
  } catch (err) {
    throw err;
  }
}

export async function updateServerInfo(globalId:string, serverInfo:object){
  try{
    const serverInfoRepo = getRepository(ServerInformation);
    return await serverInfoRepo.update({global_id: globalId}, serverInfo);
  }catch(err){
    throw err;
  }
}
