const _ = require("lodash");
import { getRepository, getMongoRepository } from "typeorm";
const ObjectId = require("mongodb").ObjectID;
import Intelligence from "../entity/Intelligence";
import IntelligenceHistory from "../entity/IntelligenceHistory";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");
const utils = require("../util/utils");
const { getConfig } = require("../config");
const retailerHelpers = require("../apis/retailers/helpers");
const {
  INTELLIGENCE_STATE,
  RETAILER_STATE,
  PERMISSIONS,
  DEFAULT_RETAILER,
} = require("../util/constants");
import { isMongo } from "../util/dbConfiguration";
import { updateProducerDB } from "./Producer.ctrl";

export function flattenToObject(intelligences) {
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
    if (_.get(intelligence, "retailer_global_id")) {
      !obj.retailer ? (obj.retailer = {}) : "";
      obj.retailer.globalId = intelligence.retailer_global_id;
    }
    if (_.get(intelligence, "retailer_state")) {
      !obj.retailer ? (obj.retailer = {}) : "";
      obj.retailer.state = intelligence.retailer_state;
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
    if (_.get(intelligence, "suitable_producers")) {
      obj.suitableProducers = intelligence.suitable_producers;
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
    if (_.get(intelligence, "system_producer_global_id")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.globalId = intelligence.system_producer_global_id;
    }
    if (_.get(intelligence, "system_producer_type")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.type = intelligence.system_producer_type;
    }
    if (_.get(intelligence, "system_producer_retry_times")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.retryTimes = intelligence.system_producer_retry_times;
    }
    if (_.get(intelligence, "system_producer_started_at")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.startedAt = intelligence.system_producer_started_at;
    }
    if (_.get(intelligence, "system_producer_ended_at")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.endedAt = intelligence.system_producer_ended_at;
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

export function objectsToIntelligences(intelligences, intelligenceInstances) {
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
    if (_.get(intelligence, "retailer.globalId")) {
      intelligenceInstance.retailer_global_id = intelligence.retailer.globalId;
    }
    if (_.get(intelligence, "retailer.state")) {
      intelligenceInstance.retailer_state = intelligence.retailer.state;
    }
    if (_.get(intelligence, "permission")) {
      intelligenceInstance.permission = intelligence.permission;
    }
    if (_.get(intelligence, "priority")) {
      intelligenceInstance.priority = intelligence.priority;
    }
    if (_.get(intelligence, "suitableProducers")) {
      intelligenceInstance.suitable_producers = intelligence.suitableProducers;
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
    if (_.get(intelligence, "system.producer.globalId")) {
      intelligenceInstance.system_producer_global_id =
        intelligence.system.producer.globalId;
    }
    if (_.get(intelligence, "system.producer.type")) {
      intelligenceInstance.system_producer_type = intelligence.system.producer.type;
    }
    if (_.get(intelligence, "system.producer.retryTimes")) {
      intelligenceInstance.system_producer_retry_times =
        intelligence.system.producer.retryTimes;
    }
    if (_.get(intelligence, "system.producer.startedAt")) {
      intelligenceInstance.system_producer_started_at =
        intelligence.system.producer.startedAt;
    }
    if (_.get(intelligence, "system.producer.endedAt")) {
      intelligenceInstance.system_producer_ended_at =
        intelligence.system.producer.endedAt;
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
    const error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->addIntelligencesDB"
    );
    logger.error(`addIntelligencesDB fail ${error.message}`, {
      error,
      parameters: {
        intelligences,
      },
    });
    throw error;
  }
}

export async function getIntelligencesOrHistoryForManagementDB(
  cursor: string,
  url: string,
  state: string,
  limit: number,
  securityKey: string,
  history?: boolean,
  ids?: string[]
) {
  try {
    let modified: any, id: string, intelligences: object[], total: number;
    if (limit) {
      limit = limit * 1;
    }
    let repoName = Intelligence;
    if (history) {
      repoName = IntelligenceHistory;
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
          $regex: utils.convertStringToRegExp(url),
        };
      }

      if (state) {
        query["system_state"] = {
          $in: state.split(","),
        };
      }

      if (ids && ids.length) {
        query.global_id = {
          $in: ids,
        };
      }

      // Query Build doesn't support for Mongo
      const repo = await getMongoRepository(repoName);
      total = await repo.count(query);
      let nQuery: any = {
        where: query,
      };
      if (modified && id) {
        nQuery.where.$or = [
          {
            system_modified_at: {
              $lt: modified * 1,
            },
          },
          // If the "sytem.modified" is an exact match, we need a tiebreaker, so we use the _id field from the cursor.
          {
            system_modified_at: modified * 1,
            _id: {
              $lt: ObjectId(id),
            },
          },
        ];
      }
      if (limit) {
        nQuery.take = limit;
      }
      nQuery.order = {
        system_modified_at: "DESC",
        _id: "DESC",
      };
      intelligences = await repo.find(nQuery);
    } else {
      const intelligenceQuery = await getRepository(
        repoName
      ).createQueryBuilder("intelligence");
      // After use *where*, then need to use *andWhere*
      let andWhere = false;
      if (securityKey) {
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[
          funName
        ]("intelligence.system_security_key = :securityKey", { securityKey });
      }

      if (url) {
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[funName]("intelligence.url LIKE :url", {
          url: `%${url}%`,
        });
      }

      if (state) {
        let states = state.split(",");
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[funName](
          "intelligence.system_state IN (:...states)",
          {
            states,
          }
        );
      }

      if (ids && ids.length) {
        intelligenceQuery.where("intelligence.global_id IN (:...ids)", {
          ids,
        });
      }

      total = await intelligenceQuery.getCount();
      if (cursor) {
        let parseCursor = utils.atob(cursor);
        parseCursor = /^(.*):_:_:_(.*)$/.exec(parseCursor);

        console.log(`parseCursor: `, parseCursor);
        console.log(`modified: `, parseCursor[1]);
        console.log(`id: `, parseCursor[2]);

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
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[
          funName
        ](
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
      total: total,
    };
  } catch (err) {
    const error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->getIntelligencesForManagementDB"
    );
    logger.error(`getIntelligencesForManagementDB fail ${error.message}`, {
      error,
      parameters: {
        cursor,
        url,
        state,
        limit,
        securityKey,
        history,
        ids,
      },
    });
    throw error;
  }
}

// Update all matched intelligences' retailer state
export async function updateIntelligencesRetailerStateForManagementDB(
  retailerGID: string,
  state: string,
  dontUpdateModified?: boolean
) {
  try {
    state = _.toUpper(state);
    if (isMongo()) {
      const repo = await getMongoRepository(Intelligence);
      let query: any = {};
      query.retailer_global_id = {
        $eq: retailerGID,
      };
      // update Retailer state and modified_at
      const retailerState:any = {
        $set: {
          retailer_state: state,
        },
      }
      if(!dontUpdateModified){
        retailerState.$set.system_modified_at = Date.now();
      }
      return await repo.updateMany(query, retailerState);
    } else {
      // SQL
      const updateData: any = {
        retailer_state: state,
      };
      if(!dontUpdateModified){
        updateData.system_modified_at = Date.now();
      }
      const intelligenceQuery = await getRepository(Intelligence)
        .createQueryBuilder("intelligence")
        .update(Intelligence)
        .set(updateData)
        .where("intelligence.retailer_global_id = :id", {
          id: retailerGID,
        });
      return await intelligenceQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->updateIntelligencesRetailerStateForManagementDB"
    );
    logger.error(
      `updateIntelligencesRetailerStateForManagementDB, error:${error.message}`,
      { error }
    );
    throw error;
  }
}

export async function updateIntelligencesStateForManagementDB(
  state: any,
  url: string,
  selectedState: string,
  ids: string[],
  timeoutStartedAt: Number,
  securityKey: string,
  dontUpdateModified?: boolean
) {
  try {
    state = _.toUpper(state);
    // Don't allow user to mass update draft status to other status
    // Don't update same status
    let states = [INTELLIGENCE_STATE.draft, state];
    if (
      state === INTELLIGENCE_STATE.configured ||
      state === INTELLIGENCE_STATE.paused
    ) {
      states.push(INTELLIGENCE_STATE.running);
    }

    if (isMongo()) {
      const repo = await getMongoRepository(Intelligence);
      const query: any = {};
      const mongoDBUdpateData: any = {
        $set: {
          system_state: state,
        },
      };

      if(!dontUpdateModified){
        // if `dontUpdateModified` is true, then don't udpate modified, otherwise, update modified
        // The reason of `dontUpdateModified` is when interval check task status or retailer services status, if update `system_modified_at` will cause pagination doesn't work
        mongoDBUdpateData.$set.system_modified_at = Date.now();
      }

      query.system_state = {
        $nin: states,
      };

      if (securityKey) {
        query.system_security_key = securityKey;
      }

      if (ids && ids.length) {
        query.global_id = {
          $in: ids,
        };
      }

      if (selectedState) {
        query["system_state"] = {
          $in: selectedState.split(","),
        };
      }

      if (url) {
        query.url = {
          $regex: utils.convertStringToRegExp(url),
        };
      }

      // any value less than `startedAt`, it will set to timeout, whatever what state you pass
      if (timeoutStartedAt) {
        // Only timeout currently is in  `RUNNING` state, other state don't need timeout
        query.system_state.$in = [INTELLIGENCE_STATE.running];
        query.system_started_at = {
          $lt: timeoutStartedAt,
        };
        mongoDBUdpateData.$set.system_producer_ended_at = Date.now();
        mongoDBUdpateData.$set.system_ended_at = Date.now();
        mongoDBUdpateData.$set.system_state = INTELLIGENCE_STATE.timeout;
        mongoDBUdpateData.$set.system_failures_reason =
          "Producer collect intelligence timeout. Engine automatically set to TIMEOUT status";
        // Since this is set by system, so don't auto increase fail number
        // Actually, it isn't easy to auto increase `system_failures_number` ^_^
      }

      return await repo.updateMany(query, mongoDBUdpateData);
    } else {
      // SQL
      const intelligenceQuery = getRepository(Intelligence)
        .createQueryBuilder("intelligence")
        .update(Intelligence);

      const sqlUpdateData: any = {
        system_state: state,
      };

      if(!dontUpdateModified){
        // if `dontUpdateModified` is true, then don't udpate modified, otherwise, update modified
        // The reason of `dontUpdateModified` is when interval check task status or retailer services status, if update `system_modified_at` will cause pagination doesn't work
        sqlUpdateData.system_modified_at = () => Date.now().toString();
      }

      intelligenceQuery.where("intelligence.system_state NOT IN (:...states)", {
        states,
      });

      if (securityKey) {
        intelligenceQuery.andWhere(
          "intelligence.system_security_key = :securityKey",
          { securityKey }
        );
      }

      if (ids && ids.length) {
        intelligenceQuery.andWhere("intelligence.global_id IN (:...ids)", {
          ids,
        });
      }

      if (url) {
        intelligenceQuery.andWhere("intelligence.url LIKE :url", {
          url: `%${url}%`,
        });
      }

      if (selectedState) {
        intelligenceQuery.andWhere(
          "intelligence.system_state IN (:...selectedState)",
          {
            selectedState: selectedState.split(","),
          }
        );
      }

      if (timeoutStartedAt) {
        intelligenceQuery.andWhere(
          "intelligence.system_started_at < :timeoutStartedAt",
          { timeoutStartedAt }
        );
        intelligenceQuery.andWhere(
          "intelligence.system_state IN (:...requiredStates)",
          {
            requiredStates: [INTELLIGENCE_STATE.running],
          }
        );
        sqlUpdateData.system_producer_ended_at = Date.now();
        sqlUpdateData.system_ended_at = Date.now();
        sqlUpdateData.system_state = INTELLIGENCE_STATE.timeout;
        sqlUpdateData.system_failures_reason =
          "Producer collect intelligence timeout. Engine automatically set to TIMEOUT status";
      }

      intelligenceQuery.set(sqlUpdateData);
      return await intelligenceQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->updateIntelligencesStateForManagementDB"
    );
    logger.error(
      `updateIntelligencesStateForManagementDB, error: ${error.message}`,
      { error }
    );
    throw error;
  }
}

export async function deleteIntelligencesOrHistoryForManagementDB(
  url: string,
  selectedState: string,
  ids: string[],
  securityKey: string,
  history?: boolean
) {
  try {
    let repoName = Intelligence;
    if (history) {
      repoName = IntelligenceHistory;
    }
    if (isMongo()) {
      const repo = await getMongoRepository(repoName);
      let query: any = {};

      if (securityKey) {
        query.system_security_key = securityKey;
      }

      if (selectedState) {
        query["system_state"] = {
          $in: selectedState.split(","),
        };
      }

      if (ids && ids.length) {
        query.global_id = {
          $in: ids,
        };
      }
      if (url) {
        query.url = {
          $regex: utils.convertStringToRegExp(url),
        };
      }
      return await repo.deleteMany(query);
    } else {
      // SQL
      console.log("repoName: ", repoName);
      const intelligenceQuery = await getRepository(repoName)
        .createQueryBuilder()
        .delete()
        .from(repoName);
      // After use *where*, then need to use *andWhere*
      let andWhere = false;
      if (securityKey) {
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[funName]("system_security_key = :securityKey", {
          securityKey,
        });
      }

      if (ids && ids.length) {
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[funName]("global_id IN (:...ids)", {
          ids,
        });
      }

      if (url) {
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[funName]("url LIKE :url", {
          url: `%${url}%`,
        });
      }

      if (selectedState) {
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        intelligenceQuery[funName](
          "intelligence.system_state IN (:...states)",
          {
            states: selectedState.split(","),
          }
        );
      }
      return await intelligenceQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->deleteIntelligencesForManagementDB"
    );
    logger.error(`deleteIntelligencesForManagementDB, error:${error.message}`, {
      error,
    });
    throw error;
  }
}

export async function deleteIntelligencesByRetailerForManagementDB(
  retailerGID: string,
  securityKey: string
) {
  try {
    if (isMongo()) {
      const repo = await getMongoRepository(Intelligence);
      let query: any = {};

      if (securityKey) {
        query.system_security_key = securityKey;
      }

      query.retailer_global_id = {
        $in: [retailerGID],
      };
      return await repo.deleteMany(query);
    } else {
      // SQL
      const intelligenceQuery = await getRepository(Intelligence)
        .createQueryBuilder("intelligence")
        .delete()
        .from(Intelligence)
        .where("intelligence.retailer_global_id = :id", {
          id: retailerGID,
        });

      if (securityKey) {
        intelligenceQuery.andWhere(
          "intelligence.system_security_key = :securityKey",
          { securityKey }
        );
      }

      return await intelligenceQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->deleteIntelligencesByRetailerForManagementDB"
    );
    logger.error(
      `deleteIntelligencesByRetailerForManagementDB, error:${error.message}`,
      { error }
    );
    throw error;
  }
}

export async function getIntelligencesForProducerDB(
  producerConfig: any,
  securityKey: string
) {
  try {
    let intelligences = [];
    let concurrent = Number(producerConfig.concurrent);
    if (isNaN(concurrent)) {
      // if concurrent isn't a number, then use default value
      concurrent = getConfig("EACH_TIME_INTELLIGENCES_NUMBER");
    }
    let permission = PERMISSIONS.private;
    if (!producerConfig.private) {
      permission = PERMISSIONS.public;
    }
    let repo;
    // logger.debug("getIntelligencesForProducerDB->producerConfig: %s", producerConfig);
    // logger.debug("getIntelligencesForProducerDB->securityKey: %s", securityKey);
    if (isMongo()) {
      repo = await getMongoRepository(Intelligence);
      let query: any = {
        where: {},
      };
      query.where.system_state = {
        $nin: [
          INTELLIGENCE_STATE.draft,
          INTELLIGENCE_STATE.running,
          INTELLIGENCE_STATE.finished,
          INTELLIGENCE_STATE.paused,
        ],
      };
      query.where.retailer_state = {
        $eq: RETAILER_STATE.active,
      };
      query.where.suitable_producers = {
        $elemMatch: {
          $eq: _.toUpper(producerConfig.type),
        },
      };

      query.take = concurrent;
      query.order = {
        retailer_global_id: "DESC",
        priority: "ASC",
      };

      // logger.debug("getIntelligencesForProducerDB->query", query);

      // if security key provide, get all intelligences for this security key first
      if (securityKey) {
        query.where.system_security_key = securityKey;
        intelligences = await repo.find(query);
        // if permission doesn't exit or producer is public then try to see any public intelligences need to collect
        if (
          (!permission || _.upperCase(permission) === PERMISSIONS.public) &&
          (!intelligences || !intelligences.length)
        ) {
          // if no intelligences for this securityKey and if this producer's permission is public then, get other intelligences that is public
          delete query.where.system_security_key;
          query.where.permission = {
            $nin: [PERMISSIONS.private],
          };

          intelligences = await repo.find(query);
        }
      } else {
        // if securityKey is empty, this means it is on-primse mode, if a request was sent by UI Server, it always contains a securityKey, only if this request is directly sent to
        // DIA-Engine, then it possible don't have securityKey, in this mode, then it should be able to get all permissions intelligences since they are belong to same user
        intelligences = await repo.find(query);
      }
    } else {
      // SQL
      const intelligenceQuery = await getRepository(
        Intelligence
      ).createQueryBuilder("intelligence");

      const intelligenceQueryNoSecurityKey = await getRepository(
        Intelligence
      ).createQueryBuilder("intelligence");

      intelligenceQuery.where("intelligence.system_state NOT IN (:...states)", {
        states: [
          INTELLIGENCE_STATE.draft,
          INTELLIGENCE_STATE.running,
          INTELLIGENCE_STATE.finished,
          INTELLIGENCE_STATE.paused,
        ],
      });
      intelligenceQuery.andWhere("intelligence.retailer_state = :state", {
        state: RETAILER_STATE.active,
      });
      intelligenceQuery.andWhere(
        "intelligence.suitable_producers LIKE :producerType",
        { producerType: `%${_.toUpper(producerConfig.type)}%` }
      );
      intelligenceQuery.orderBy({
        retailer_global_id: "DESC",
        priority: "ASC",
      });
      intelligenceQuery.limit(concurrent);

      intelligenceQueryNoSecurityKey.where(
        "intelligence.system_state NOT IN (:...states)",
        {
          states: [
            INTELLIGENCE_STATE.draft,
            INTELLIGENCE_STATE.running,
            INTELLIGENCE_STATE.finished,
            INTELLIGENCE_STATE.paused,
          ],
        }
      );
      intelligenceQueryNoSecurityKey.andWhere(
        "intelligence.retailer_state = :state",
        {
          state: RETAILER_STATE.active,
        }
      );
      intelligenceQueryNoSecurityKey.andWhere(
        "intelligence.suitable_producers LIKE :producerType",
        { producerType: `%${_.toUpper(producerConfig.type)}%` }
      );
      intelligenceQueryNoSecurityKey.orderBy({
        retailer_global_id: "DESC",
        priority: "ASC",
      });
      intelligenceQueryNoSecurityKey.limit(concurrent);
      // if security key provide, get all intelligences for this security key first
      if (securityKey) {
        intelligenceQuery.andWhere(
          "intelligence.system_security_key = :securityKey",
          { securityKey }
        );
        intelligences = await intelligenceQuery.getMany();

        if (
          (!permission || _.upperCase(permission) === PERMISSIONS.public) &&
          (!intelligences || !intelligences.length)
        ) {
          // if no intelligences for this securityKey and if this producer's permission is public then, get other intelligences that is public
          intelligenceQueryNoSecurityKey.andWhere(
            "intelligence.permission NOT IN (:...permissions)",
            {
              permissions: [PERMISSIONS.private],
            }
          );
          intelligences = await intelligenceQueryNoSecurityKey.getMany();
        }
      } else {
        // if securityKey is empty, this means it is on-primse mode, if a request was sent by UI Server, it always contains a securityKey, only if this request is directly sent to
        // DIA-Engine, then it possible don't have securityKey, in this mode, then it should be able to get all permissions intelligences since they are belong to same user
        intelligences = await intelligenceQuery.getMany();
      }
    }

    intelligences = flattenToObject(intelligences);

    let gids = [];
    let retailers = {};
    for (let i = 0; i < intelligences.length; i++) {
      let item = intelligences[i] || {};
      gids.push(item.globalId);
      if (retailers[item.retailer.globalId]) {
        item.retailer = retailers[item.retailer.globalId];
      } else {
        let retailer = await retailerHelpers.getRetailer(item.retailer.globalId);
        retailer = _.merge({}, DEFAULT_RETAILER, retailer);
        // remove unnecessary data
        retailer = utils.omit(
          retailer,
          ["_id", "securityKey", "created", "modified"],
          ["system"]
        );
        retailers[item.retailer.globalId] = retailer;
        item.retailer = retailers[item.retailer.globalId];
      }

      // Comment: 07/30/2019
      // Reason: Since this intelligence is reassigned, so it always need to update producer information
      // if (!item.producer) {
      //   item.producer = {
      //     globalId: producerGid,
      //     type: _.toUpper(producerConfig.type),
      //     started_at: Date.now()
      //   };
      // }
      item.system.producer = {
        globalId: producerConfig.globalId,
        type: _.toUpper(producerConfig.type),
      };
    }

    let updateData: any = {
      system_started_at: Date.now(),
      system_ended_at: Date.now(),
      system_modified_at: Date.now(),
      system_state: INTELLIGENCE_STATE.running,
      system_producer_global_id: producerConfig.globalId,
      system_producer_type: _.toUpper(producerConfig.type),
    };

    if (isMongo()) {
      // Update intelligences that return to producer
      await repo.updateMany(
        {
          global_id: {
            $in: gids,
          },
        },
        {
          $set: updateData,
        }
      );
    } else {
      // SQL
      let query = await getRepository(Intelligence)
        .createQueryBuilder("intelligence")
        .update(Intelligence)
        .set(updateData);
      query.where("intelligence.global_id IN (:...gids)", {
        gids,
      });
      await query.execute();
    }

    // Update Producer Last Ping
    // Don't need to wait producer update finish
    updateProducerDB(producerConfig.globalId, securityKey, {
      system: {
        modified: Date.now(),
        lastPing: Date.now(),
      },
    });

    // TODO: 2019/11/10 need to rethink about this logic, since intelligences already send back to producers
    //        if we check for now, it is meaningless, better way is let producer to tell. For example, if collect
    //        intelligences fail, then check Retailer or direct know retailer is inactive

    // Check Retailer status in parallel
    // // After get intelligences that need to collect, during sametime to check whether this Retailer is active.
    // for (let gid in retailers) {
    //   let retailer = retailers[gid];
    //   // if this retailer isn't in check status progress, then check it
    //   if (!__check_retailers_status__[gid]) {
    //     (async () => {
    //       // change retailer status to true to avoid duplicate check in same time
    //       __check_retailers_status__[gid] = true;
    //       await retailersHelpers.updateRetailerState(gid, retailer);
    //       // after finish, delete its value in hashmap
    //       delete __check_retailers_status__[gid];
    //     })();
    //   }
    // }
    return intelligences;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->getIntelligencesForProducerDB"
    );
    logger.error(`getIntelligencesForProducerDB, error:${error.message}`, {
      error,
    });
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
        where: {},
      };
      if (securityKey) {
        query.where["system_security_key"] = securityKey;
      }
      query.where.global_id = {
        $in: gids,
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
      "IntelligenceAndHistory.ctrl->getIntelligencesDB"
    );
    logger.error(`getIntelligencesDB, error:${error.message}`, { error });
    throw error;
  }
}

export async function deleteIntelligencesDB(
  gids: string[],
  securityKey: string
) {
  try {
    if (isMongo()) {
      let query: any = {};
      if (securityKey) {
        query.system_security_key = securityKey;
      }
      query.global_id = {
        $in: gids,
      };
      const repo = getMongoRepository(Intelligence);
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
      "IntelligenceAndHistory.ctrl->deleteIntelligencesDB"
    );
    logger.error(`deleteIntelligencesDB, error:${error.message}`, { error });
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
    let repo;
    if (isMongo()) {
      repo = getMongoRepository(Intelligence);
    } else {
      repo = getRepository(Intelligence);
    }
    for (let i = 0; i < intelligences.length; i++) {
      let intelligence = intelligences[i];
      intelligence = objectsToIntelligences(intelligence, {});
      if (isMongo()) {
        logger.debug(`updateEachIntelligencesDB->isMongo`, {
          i,
          global_id: intelligence.global_id,
        });
        await repo.updateOne(
          {
            global_id: intelligence.global_id,
          },
          {
            $set: intelligence,
          }
        );
      } else {
        logger.debug(`updateEachIntelligencesDB->sqlite`, {
          i,
          global_id: intelligence.global_id,
        });
        await repo
          .createQueryBuilder("intelligence")
          .update(Intelligence)
          .set(intelligence)
          .where("intelligence.global_id = :gloalId", {
            gloalId: intelligence.global_id,
          })
          .execute();
      }
    }
  } catch (err) {
    const error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "IntelligenceAndHistory.ctrl->updateEachIntelligencesDB"
    );
    logger.error(`updateEachIntelligencesDB fail ${error.message}`, {
      error,
    });
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
    // everytime insert 10 items
    while (intelligenceInstances.length) {
      let insertData = intelligenceInstances.splice(0, 10);
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
      "IntelligenceHistory.ctrl->addIntelligenceHistoryDB"
    );
    logger.error(`addIntelligenceHistoryDB, error:${error.message}`, { error });
    throw error;
  }
}
