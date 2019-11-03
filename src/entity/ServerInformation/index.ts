import { isMongo } from "../../util/dbConfiguration";
import { ServerInformation as ServerInformationMongo } from "./ServerInformation.mongo";
import { ServerInformation as ServerInformationSQL } from "./ServerInformation.sql";

let ServerInformation: any;
if (isMongo()) {
  ServerInformation = ServerInformationMongo;
} else {
  ServerInformation = ServerInformationSQL;
}

export default ServerInformation;
