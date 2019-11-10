const _ = require("lodash");
import { getRepository, getMongoRepository, ObjectID } from "typeorm";
import Intelligence from "../entity/Intelligence";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");
const utils = require("../util/utils");
import { isMongo } from "../util/dbConfiguration";

function flattenToObject(intelligences) {
  function toObject(intelligence) {
    let obj: any = {};
    if (_.get(intelligence, "global_id")) {
      obj.globalId = intelligence.global_id;
    }
    if (_.get(intelligence, "type")) {
      obj.type = intelligence.type;
    }
    if (_.get(intelligence, "name")) {
      obj.name = intelligence.name;
    }
    if (_.get(intelligence, "description")) {
      obj.description = intelligence.description;
    }
    if (_.get(intelligence, "soi_global_id")) {
      !obj.soi ? (obj.soi = {}) : "";
      obj.soi.globalId = intelligence.soi_global_id;
    }
    if (_.get(intelligence, "soi_state")) {
      !obj.soi ? (obj.soi = {}) : "";
      obj.soi.state = intelligence.soi_state;
    }
    if (_.get(intelligence, "permission")) {
      obj.permission = intelligence.permission;
    }
    if (_.get(intelligence, "priority")) {
      obj.priority = intelligence.priority;
    }
    if (_.get(intelligence, "permission")) {
      obj.permission = intelligence.permission;
    }
    if (_.get(intelligence, "suitable_agents")) {
      obj.suitableAgents = intelligence.suitable_agents;
    }
    if (_.get(intelligence, "url")) {
      obj.url = intelligence.url;
    }
    if (_.get(intelligence, "metadata")) {
      obj.metadata = intelligence.metadata;
    }
    if (_.get(intelligence, "metadata")) {
      obj.dataset = intelligence.dataset;
    }
    if (_.get(intelligence, "system_state")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.state = intelligence.system_state;
    }
    if (_.get(intelligence, "system_security_key")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.securityKey = intelligence.system_security_key;
    }
    if (_.get(intelligence, "system_created_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.created = intelligence.system_created_at;
    }
    if (_.get(intelligence, "system_modified_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.modified = intelligence.system_modified_at;
    }
    if (_.get(intelligence, "system_started_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.startedAt = intelligence.system_started_at;
    }
    if (_.get(intelligence, "system_ended_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.endedAt = intelligence.system_ended_at;
    }
    if (_.get(intelligence, "system_version")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.version = intelligence.system_version;
    }
    if (_.get(intelligence, "system_failures_number")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.failuresNumber = intelligence.system_failures_number;
    }
    if (_.get(intelligence, "system_failures_reason")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.failuresReason = intelligence.system_failures_reason;
    }
    if (_.get(intelligence, "system_agent_global_id")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.agent ? (obj.system.agent = {}) : "";
      obj.system.agent.globalId = intelligence.system_agent_global_id;
    }
    if (_.get(intelligence, "system_agent_type")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.agent ? (obj.system.agent = {}) : "";
      obj.system.agent.type = intelligence.system_agent_type;
    }
    if (_.get(intelligence, "system_agent_retry_times")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.agent ? (obj.system.agent = {}) : "";
      obj.system.agent.retryTimes = intelligence.system_agent_retry_times;
    }
    if (_.get(intelligence, "system_agent_started_at")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.agent ? (obj.system.agent = {}) : "";
      obj.system.agent.startedAt = intelligence.system_agent_started_at;
    }
    if (_.get(intelligence, "system_agent_ended_at")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.agent ? (obj.system.agent = {}) : "";
      obj.system.agent.endedAt = intelligence.system_agent_ended_at;
    }

    return obj;
  }

  if (_.isArray(intelligences)) {
    let arr = [];
    for (let i = 0; i < intelligences.length; i++) {
      arr.push(toObject(intelligences[i]));
    }
    return arr;
  } else {
    return toObject(intelligences);
  }
}

function objectsToIntelligences(intelligences, intelligenceInstances) {
  function objectToIntelligences(intelligence, intelligenceInstance) {
    if (!intelligenceInstance) {
      intelligenceInstance = new Intelligence();
    }
    if (_.get(intelligence, "globalId")) {
      intelligenceInstance.global_id = intelligence.globalId;
    }
    if (_.get(intelligence, "type")) {
      intelligenceInstance.type = intelligence.type;
    }
    if (_.get(intelligence, "name")) {
      intelligenceInstance.name = intelligence.name;
    }
    if (_.get(intelligence, "desciption")) {
      intelligenceInstance.desciption = intelligence.desciption;
    }
    if (_.get(intelligence, "soi.globalId")) {
      intelligenceInstance.soi_global_id = intelligence.soi.globalId;
    }
    if (_.get(intelligence, "soi.state")) {
      intelligenceInstance.soi_state = intelligence.soi.state;
    }
    if (_.get(intelligence, "permission")) {
      intelligenceInstance.permission = intelligence.permission;
    }
    if (_.get(intelligence, "priority")) {
      intelligenceInstance.priority = intelligence.priority;
    }
    if (_.get(intelligence, "suitableAgents")) {
      intelligenceInstance.suitable_agents = intelligence.suitableAgents;
    }
    if (_.get(intelligence, "url")) {
      intelligenceInstance.url = intelligence.url;
    }
    if (_.get(intelligence, "metadata")) {
      intelligenceInstance.metadata = intelligence.metadata;
    }
    if (_.get(intelligence, "dataset")) {
      intelligenceInstance.dataset = intelligence.dataset;
    }
    if (_.get(intelligence, "system.state")) {
      intelligenceInstance.system_state = intelligence.system.state;
    }
    if (_.get(intelligence, "system.securityKey")) {
      intelligenceInstance.system_security_key =
        intelligence.system.securityKey;
    }
    if (_.get(intelligence, "system.created")) {
      intelligenceInstance.system_created_at = intelligence.system.created;
    }
    if (_.get(intelligence, "system.modified")) {
      intelligenceInstance.system_modified_at = intelligence.system.modified;
    }
    if (_.get(intelligence, "system.startedAt")) {
      intelligenceInstance.system_started_at = intelligence.system.startedAt;
    }
    if (_.get(intelligence, "system.endedAt")) {
      intelligenceInstance.system_ended_at = intelligence.system.endedAt;
    }
    if (_.get(intelligence, "system.agent.globalId")) {
      intelligenceInstance.system_agent_global_id =
        intelligence.system.agent.globalId;
    }
    if (_.get(intelligence, "system.agent.type")) {
      intelligenceInstance.system_agent_type = intelligence.system.agent.type;
    }
    if (_.get(intelligence, "system.agent.retryTimes")) {
      intelligenceInstance.system_agent_retry_times =
        intelligence.system.agent.retryTimes;
    }
    if (_.get(intelligence, "system.agent.startedAt")) {
      intelligenceInstance.system_agent_started_at =
        intelligence.system.agent.startedAt;
    }
    if (_.get(intelligence, "system.agent.endedAt")) {
      intelligenceInstance.system_agent_ended_at =
        intelligence.system.agent.endedAt;
    }
    if (_.get(intelligence, "system.version")) {
      intelligenceInstance.system_version = intelligence.system.version;
    }
    if (_.get(intelligence, "system.failuresNumber")) {
      intelligenceInstance.system_failures_number =
        intelligence.system.failuresNumber;
    }
    if (_.get(intelligence, "system.failuresReason")) {
      intelligenceInstance.system_failures_reason =
        intelligence.system.failuresReason;
    }

    return intelligenceInstance;
  }
  if (_.isArray(intelligences)) {
    let arr = [];
    for (let i = 0; i < intelligences.length; i++) {
      arr.push(
        objectToIntelligences(
          intelligences[i],
          intelligenceInstances && intelligenceInstances[i]
        )
      );
    }
    return arr;
  } else {
    return objectToIntelligences(intelligences, intelligenceInstances);
  }
}

export async function addIntelligencesDB(intelligences) {
  try {
    const repo = getRepository(Intelligence);
    let intelligenceInstances: any = objectsToIntelligences(
      intelligences,
      null
    );
    let generatedMaps = [];
    // everytime insert 5 items
    while (intelligenceInstances.length) {
      let insertData = intelligenceInstances.splice(0, 5);
      let result = await repo.insert(insertData);
      generatedMaps.push(result.generatedMaps);
    }
    return generatedMaps;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->addIntelligencesDB"
    );
    logger.error("addIntelligencesDB, error:", error);
    throw error;
  }
}

export async function getIntelligencesForManagementDB(
  cursor: string,
  url: string,
  state: string,
  limit: number,
  securityKey: string
) {
  let modified: any, id: string, intelligences: object[], total: number;
  if (limit) {
    limit = limit * 1;
  }
  if (isMongo()) {
    if (cursor) {
      let parseCursor = utils.atob(cursor);
      parseCursor = /^(.*):_:_:_(.*)$/.exec(parseCursor);
      modified = parseCursor[1];
      id = parseCursor[2];
    }

    let query: any = {};
    if (securityKey) {
      query["system_security_key"] = securityKey;
    }

    if (url) {
      query.url = {
        $regex: utils.convertStringToRegExp(url)
      };
    }

    if (state) {
      query["system_state"] = {
        $in: state.split(",")
      };
    }

    // Query Build doesn't support for Mongo
    const repo = await getMongoRepository(Intelligence);
    total = await repo.count(query);
    let nQuery:any = {
      where: query
    };
    if (modified && id) {
      nQuery.where.$or = [
        {
          system_modified_at: {
            $lt: modified * 1
          }
        },
        // If the "sytem.modified" is an exact match, we need a tiebreaker, so we use the _id field from the cursor.
        {
          system_modified_at: modified * 1,
          _id: {
            $lt: id
          }
        }
      ];
    }
    nQuery.take = limit || 50;
    nQuery.order = {
      system_modified_at: "DESC",
      _id: "DESC"
    };
    intelligences = await repo.find(nQuery);
  } else {
    const intelligenceQuery = await getRepository(
      Intelligence
    ).createQueryBuilder("intelligence");
    // After use *where*, then need to use *andWhere*
    let andWhere = false;
    if (securityKey) {
      let funName;
      if (andWhere) {
        funName = "andWhere";
      } else {
        funName = "where";
        andWhere = true;
      }
      intelligenceQuery[funName](
        "intelligence.system_security_key = :securityKey",
        { securityKey }
      );
    }

    if (url) {
      let funName;
      if (andWhere) {
        funName = "andWhere";
      } else {
        funName = "where";
        andWhere = true;
      }
      intelligenceQuery[funName]("intelligence.url LIKE :url", {
        url: `%${url}%`
      });
    }

    if (state) {
      let states = state.split(",");
      let funName;
      if (andWhere) {
        funName = "andWhere";
      } else {
        funName = "where";
        andWhere = true;
      }
      intelligenceQuery[funName]("intelligence.system_state IN (:...states)", {
        states
      });
      // intelligenceQuery[funName]("intelligence.system_state IN ('TIMEOUT', 'CONFIGURED')");
    }

    total = await intelligenceQuery.getCount();
    if (cursor) {
      let parseCursor = utils.atob(cursor);
      parseCursor = /^(.*):_:_:_(.*)$/.exec(parseCursor);
      modified = parseCursor[1];
      id = parseCursor[2];
    }

    if (limit) {
      limit = limit * 1;
      intelligenceQuery.limit(limit);
    }
    intelligenceQuery.orderBy({ system_modified_at: "DESC", id: "DESC" });
    if (modified && id) {
      modified = modified * 1;
      let funName;
      if (andWhere) {
        funName = "andWhere";
      } else {
        funName = "where";
        andWhere = true;
      }
      intelligenceQuery[funName](
        "intelligence.system_modified_at < :modified OR (intelligence.system_modified_at < :modified AND intelligence.id < :id)",
        { modified, id }
      );
    }

    intelligences = await intelligenceQuery.getMany();
  }
  const lastItem: any = intelligences[intelligences.length - 1];
  let nextCursor = null;
  if (lastItem && intelligences.length >= limit) {
    nextCursor = utils.btoa(
      `${lastItem.system_modified_at}:_:_:_${lastItem.id}`
    );
  }

  if (nextCursor === cursor) {
    nextCursor = null;
  }
  return {
    previousCursor: cursor,
    nextCursor: nextCursor,
    intelligences: flattenToObject(intelligences),
    total: total
  };
}
