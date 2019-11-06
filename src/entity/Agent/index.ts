import { isMongo } from "../../util/dbConfiguration";
import { Agent as AgentMongo } from "./Agent.mongodb";
import { Agent as AgentSQL } from "./Agent.sql";

let Agent: any;
if (isMongo()) {
  Agent = AgentMongo;
} else {
  Agent = AgentSQL;
}

export default Agent;
