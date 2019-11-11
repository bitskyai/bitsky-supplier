const _ = require("lodash");
import { getRepository, getMongoRepository } from "typeorm";
const ObjectId = require("mongodb").ObjectID;
import Intelligence from "../entity/Intelligence";
import IntelligenceHistory from "../entity/IntelligenceHistory";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");
const utils = require("../util/utils");
const config = require("../config");
const {
  INTELLIGENCE_STATE,
  SOI_STATE,
  PERMISSIONS,
  DEFAULT_SOI
} = require("../util/constants");
import { isMongo } from "../util/dbConfiguration";
const soisHelpers = require("../apis/sois/helpers");
import { updateAgentDB } from "../dbController/Agent.ctrl";

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

export async function addIntelligenceHistoryDB(intelligences) {
  try {
    const repo = getRepository(IntelligenceHistory);
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
      "Intelligence.ctrl->addIntelligenceHistoryDB"
    );
    logger.error("addIntelligenceHistoryDB, error:", error);
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
  try {
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
      let nQuery: any = {
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
              $lt: ObjectId(id)
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
        intelligenceQuery[funName](
          "intelligence.system_state IN (:...states)",
          {
            states
          }
        );
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
          "intelligence.system_modified_at < :modified OR (intelligence.system_modified_at = :modified AND intelligence.id < :id)",
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
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->getIntelligencesForManagementDB"
    );
    logger.error("getIntelligencesForManagementDB, error:", error);
    throw error;
  }
}

export async function updateIntelligencesStateForManagementDB(
  state: any,
  url: string,
  ids: string[],
  securityKey: string
) {
  try {
    state = _.toUpper(state);
    let states = [INTELLIGENCE_STATE.draft];
    if (state === INTELLIGENCE_STATE.configured) {
      states = [INTELLIGENCE_STATE.running, INTELLIGENCE_STATE.draft];
    }
    if (isMongo()) {
      const repo = await getMongoRepository(Intelligence);
      let query: any = {};
      // Don't Running or Draft intelligences
      query.system_state = {
        $nin: states
      };
      if (securityKey) {
        query.system_security_key = securityKey;
      }

      if (ids && ids.length) {
        query.global_id = {
          $in: ids
        };
      } else {
        if (url) {
          query.url = {
            $regex: utils.convertStringToRegExp(url)
          };
        }
      }
      return await repo.updateMany(query, {
        $set: {
          system_modified_at: Date.now(),
          system_state: state
        }
      });
    } else {
      // SQL
      const intelligenceQuery = await getRepository(Intelligence)
        .createQueryBuilder("intelligence")
        .update(Intelligence)
        .set({
          system_modified_at: () => Date.now().toString(),
          system_state: state
        });

      intelligenceQuery.where("intelligence.system_state NOT IN (:...states)", {
        states
      });

      if (securityKey) {
        intelligenceQuery.andWhere(
          "intelligence.system_security_key = :securityKey",
          { securityKey }
        );
      }

      if (ids && ids.length) {
        intelligenceQuery.where("intelligence.global_id IN (:...ids)", {
          ids
        });
      } else {
        if (url) {
          intelligenceQuery.andWhere("intelligence.url LIKE :url", {
            url: `%${url}%`
          });
        }
      }
      return await intelligenceQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->updateIntelligencesStateForManagementDB"
    );
    logger.error("updateIntelligencesStateForManagementDB, error:", error);
    throw error;
  }
}

export async function deleteIntelligencesForManagementDB(
  url: string,
  ids: string[],
  securityKey: string
) {
  try {
    if (isMongo()) {
      const repo = await getMongoRepository(Intelligence);
      let query: any = {};

      if (securityKey) {
        query.system_security_key = securityKey;
      }

      if (ids && ids.length) {
        query.global_id = {
          $in: ids
        };
      } else {
        if (url) {
          query.url = {
            $regex: utils.convertStringToRegExp(url)
          };
        }
      }
      return await repo.deleteMany(query);
    } else {
      // SQL
      const intelligenceQuery = await getRepository(Intelligence)
        .createQueryBuilder("intelligence")
        .delete()
        .from(Intelligence);
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

      if (ids && ids.length) {
        let funName;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[funName]("intelligence.global_id IN (:...ids)", {
          ids
        });
      } else {
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
      }
      return await intelligenceQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->deleteIntelligencesForManagementDB"
    );
    logger.error("deleteIntelligencesForManagementDB, error:", error);
    throw error;
  }
}

export async function getIntelligencesForAgentDB(
  agentConfig: any,
  securityKey: string
) {
  try {
    let intelligences = [];
    if (isMongo()) {
      const repo = await getMongoRepository(Intelligence);
      let concurrent = Number(agentConfig.concurrent);
      if (isNaN(concurrent)) {
        // if concurrent isn't a number, then use default value
        concurrent = config.EACH_TIME_INTELLIGENCES_NUMBER;
      }
      let query: any = {
        where: {}
      };
      query.where.system_state = {
        $nin: [
          INTELLIGENCE_STATE.draft,
          INTELLIGENCE_STATE.running,
          INTELLIGENCE_STATE.finished,
          INTELLIGENCE_STATE.paused
        ]
      };
      query.where.soi_state = {
        $eq: SOI_STATE.active
      };
      query.where.suitable_agents = {
        $elemMatch: {
          $eq: _.toUpper(agentConfig.type)
        }
      };

      query.take = concurrent;
      query.order = {
        soi_global_id: "DESC",
        priority: "ASC"
      };

      // if security key provide, get all intelligences for this security key first
      if (securityKey) {
        query.where.system_security_key = securityKey;
        intelligences = await repo.find(query);
      }
      let permission = PERMISSIONS.private;
      if (!agentConfig.private) {
        permission = PERMISSIONS.public;
      }

      // if permission doesn't exit or agent is public then try to see any public intelligences need to collect
      if (
        (!permission || _.upperCase(permission) === PERMISSIONS.public) &&
        (!intelligences || !intelligences.length)
      ) {
        // if no intelligences for this securityKey and if this agent's permission is public then, get other intelligences that is public
        delete query.where.system_security_key;
        query.where.permission = {
          $nin: [PERMISSIONS.private]
        };

        intelligences = await repo.find(query);
      }
      intelligences = flattenToObject(intelligences);

      let gids = [];
      let sois = {};
      for (let i = 0; i < intelligences.length; i++) {
        let item = intelligences[i] || {};
        gids.push(item.globalId);
        if (sois[item.soi.globalId]) {
          item.soi = sois[item.soi.globalId];
        } else {
          let soi = await soisHelpers.getSOI(item.soi.globalId);
          soi = _.merge({}, DEFAULT_SOI, soi);
          // remove unnecessary data
          soi = utils.omit(
            soi,
            ["_id", "securityKey", "created", "modified"],
            ["system"]
          );
          sois[item.soi.globalId] = soi;
          item.soi = sois[item.soi.globalId];
        }

        // Comment: 07/30/2019
        // Reason: Since this intelligence is reassigned, so it always need to update agent information
        // if (!item.agent) {
        //   item.agent = {
        //     globalId: agentGid,
        //     type: _.toUpper(agentConfig.type),
        //     started_at: Date.now()
        //   };
        // }
        item.system.agent = {
          globalId: agentConfig.globalId,
          type: _.toUpper(agentConfig.type)
        };
      }

      // Update intelligences that return to agent
      await repo.updateMany(
        {
          global_id: {
            $in: gids
          }
        },
        {
          $set: {
            system_started_at: Date.now(),
            system_ended_at: Date.now(),
            system_modified_at: Date.now(),
            system_state: INTELLIGENCE_STATE.running,
            system_agent_global_id: agentConfig.globalId,
            system_agent_type: _.toUpper(agentConfig.type)
          }
        }
      );

      // Update Agent Last Ping
      // Don't need to wait agent update finish
      updateAgentDB(agentConfig.globalId, securityKey, {
        system: {
          modified: Date.now(),
          lastPing: Date.now()
        }
      });

      // TODO: 2019/11/10 need to rethink about this logic, since intelligences already send back to agents
      //        if we check for now, it is meaningless, better way is let agent to tell. For example, if collect
      //        intelligences fail, then check SOI or direct know soi is inactive

      // Check SOI status in parallel
      // // After get intelligences that need to collect, during sametime to check whether this SOI is active.
      // for (let gid in sois) {
      //   let soi = sois[gid];
      //   // if this soi isn't in check status progress, then check it
      //   if (!__check_sois_status__[gid]) {
      //     (async () => {
      //       // change soi status to true to avoid duplicate check in same time
      //       __check_sois_status__[gid] = true;
      //       await soisHelpers.updateSOIState(gid, soi);
      //       // after finish, delete its value in hashmap
      //       delete __check_sois_status__[gid];
      //     })();
      //   }
      // }
      return intelligences;
    } else {
      // SQL
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->getIntelligencesForAgentDB"
    );
    logger.error("getIntelligencesForAgentDB, error:", error);
    throw error;
  }
}

/**
 * Get intelligences by globalIds
 * @param gids - intelligences globalId
 * @param securityKey - security key
 */
export async function getIntelligencesDB(gids: string[], securityKey: string) {
  try {
    if (!gids) {
      return [];
    }
    if (isMongo()) {
      let query: any = {
        where: {}
      };
      if (securityKey) {
        query.where["system_security_key"] = securityKey;
      }
      query.where.global_id = {
        $in: gids
      };
      const repo = await getMongoRepository(Intelligence);
      let intelligences = await repo.find(query);
      intelligences = flattenToObject(intelligences);
      return intelligences;
    } else {
      // sql
      const intelligenceQuery = await getRepository(
        Intelligence
      ).createQueryBuilder("intelligence");
      intelligenceQuery.where("intelligence.global_id IN (:...gids)", { gids });
      if (securityKey) {
        intelligenceQuery.andWhere(
          "intelligence.system_security_key = :securityKey",
          { securityKey }
        );
      }

      let intelligences = await intelligenceQuery.getMany();
      intelligences = flattenToObject(intelligences);
      return intelligences;
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->getIntelligencesDB"
    );
    logger.error("getIntelligencesDB, error:", error);
    throw error;
  }
}

export async function deleteIntelligencesDB(
  gids: string[],
  securityKey: string
) {
  try {
    console.log('gids: ', gids);
    if (isMongo()) {
      let query: any = {};
      if (securityKey) {
        query.system_security_key = securityKey;
      }
      query.global_id = {
        $in: gids
      };
      const repo = await getMongoRepository(Intelligence);
      return await repo.deleteMany(query);
    } else {
      return await getRepository(Intelligence)
        .createQueryBuilder("intelligence")
        .delete()
        .where("intelligence.global_id IN (:...gids)", { gids })
        .execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->deleteIntelligencesDB"
    );
    logger.error("deleteIntelligencesDB, error:", error);
    throw error;
  }
}
/**
 * Update intelligences one by one
 * Used for the updating information for each intelligences is different
 * @param intelligences{object[]}
 */
export async function updateEachIntelligencesDB(intelligences: any[]) {
  try {
    const repo = await getMongoRepository(Intelligence);
    for (let i = 0; i < intelligences.length; i++) {
      let intelligence = intelligences[i];
      intelligence = objectsToIntelligences(intelligence, {});
      await repo.updateOne(
        {
          global_id: intelligence.global_id
        },
        intelligence
      );
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Intelligence.ctrl->updateIntelligencesDB"
    );
    logger.error("updateIntelligencesDB, error:", error);
    throw error;
  }
}
