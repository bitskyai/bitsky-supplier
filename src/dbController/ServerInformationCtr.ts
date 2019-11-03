import { getRepository } from "typeorm";
import { ServerInformation } from "../entity/ServerInformation";

export async function getServerInfo() {
  try {
    const serverInfoRepo = getRepository(ServerInformation);
    const serverInfo = await serverInfoRepo.find();
    return serverInfo;
  } catch (err) {
    throw err;
  }
}

export async function addServerInfo({
  name,
  description,
  version,
  migrationVersion
}: {
  name: string;
  description: string;
  version: string;
  migrationVersion: string;
}) {
  try {
    const serverInfoRepo = getRepository(ServerInformation);
    let serverInfo = new ServerInformation();
    serverInfo.name = name;
    serverInfo.description = description;
    serverInfo.version = version;
    serverInfo.migration_version = migrationVersion;
    serverInfoRepo.save(serverInfo);
    return serverInfo;
  } catch (err) {
    throw err;
  }
}
