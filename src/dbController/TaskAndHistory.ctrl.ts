const _ = require("lodash");
import { getRepository, getMongoRepository } from "typeorm";
const ObjectId = require("mongodb").ObjectID;
import Task from "../entity/Task";
import TaskHistory from "../entity/TaskHistory";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");
const utils = require("../util/utils");
const { getConfig } = require("../config");
const retailerHelpers = require("../apis/retailers/helpers");
const {
  TASK_STATE,
  RETAILER_STATE,
  PERMISSIONS,
  DEFAULT_RETAILER,
} = require("../util/constants");
import { isMongo } from "../util/dbConfiguration";
import { updateProducerDB } from "./Producer.ctrl";

export function flattenToObject(tasks) {
  function toObject(task) {
    let obj: any = {};
    if (_.get(task, "global_id")) {
      obj.globalId = task.global_id;
    }
    if (_.get(task, "type")) {
      obj.type = task.type;
    }
    if (_.get(task, "name")) {
      obj.name = task.name;
    }
    if (_.get(task, "description")) {
      obj.description = task.description;
    }
    if (_.get(task, "retailer_global_id")) {
      !obj.retailer ? (obj.retailer = {}) : "";
      obj.retailer.globalId = task.retailer_global_id;
    }
    if (_.get(task, "retailer_state")) {
      !obj.retailer ? (obj.retailer = {}) : "";
      obj.retailer.state = task.retailer_state;
    }
    if (_.get(task, "permission")) {
      obj.permission = task.permission;
    }
    if (_.get(task, "priority")) {
      obj.priority = task.priority;
    }
    if (_.get(task, "permission")) {
      obj.permission = task.permission;
    }
    if (_.get(task, "suitable_producers")) {
      obj.suitableProducers = task.suitable_producers;
    }
    if (_.get(task, "url")) {
      obj.url = task.url;
    }
    if (_.get(task, "metadata")) {
      obj.metadata = task.metadata;
    }
    if (_.get(task, "metadata")) {
      obj.dataset = task.dataset;
    }
    if (_.get(task, "system_state")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.state = task.system_state;
    }
    if (_.get(task, "system_security_key")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.securityKey = task.system_security_key;
    }
    if (_.get(task, "system_created_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.created = task.system_created_at;
    }
    if (_.get(task, "system_modified_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.modified = task.system_modified_at;
    }
    if (_.get(task, "system_started_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.startedAt = task.system_started_at;
    }
    if (_.get(task, "system_ended_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.endedAt = task.system_ended_at;
    }
    if (_.get(task, "system_version")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.version = task.system_version;
    }
    if (_.get(task, "system_failures_number")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.failuresNumber = task.system_failures_number;
    }
    if (_.get(task, "system_failures_reason")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.failuresReason = task.system_failures_reason;
    }
    if (_.get(task, "system_producer_global_id")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.globalId = task.system_producer_global_id;
    }
    if (_.get(task, "system_producer_type")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.type = task.system_producer_type;
    }
    if (_.get(task, "system_producer_retry_times")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.retryTimes = task.system_producer_retry_times;
    }
    if (_.get(task, "system_producer_started_at")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.startedAt = task.system_producer_started_at;
    }
    if (_.get(task, "system_producer_ended_at")) {
      !obj.system ? (obj.system = {}) : "";
      !obj.system.producer ? (obj.system.producer = {}) : "";
      obj.system.producer.endedAt = task.system_producer_ended_at;
    }

    return obj;
  }

  if (_.isArray(tasks)) {
    let arr = [];
    for (let i = 0; i < tasks.length; i++) {
      arr.push(toObject(tasks[i]));
    }
    return arr;
  } else {
    return toObject(tasks);
  }
}

export function objectsToTasks(tasks, taskInstances) {
  function objectToTasks(task, taskInstance) {
    if (!taskInstance) {
      taskInstance = new Task();
    }
    if (_.get(task, "globalId")) {
      taskInstance.global_id = task.globalId;
    }
    if (_.get(task, "type")) {
      taskInstance.type = task.type;
    }
    if (_.get(task, "name")) {
      taskInstance.name = task.name;
    }
    if (_.get(task, "desciption")) {
      taskInstance.desciption = task.desciption;
    }
    if (_.get(task, "retailer.globalId")) {
      taskInstance.retailer_global_id = task.retailer.globalId;
    }
    if (_.get(task, "retailer.state")) {
      taskInstance.retailer_state = task.retailer.state;
    }
    if (_.get(task, "permission")) {
      taskInstance.permission = task.permission;
    }
    if (_.get(task, "priority")) {
      taskInstance.priority = task.priority;
    }
    if (_.get(task, "suitableProducers")) {
      taskInstance.suitable_producers = task.suitableProducers;
    }
    if (_.get(task, "url")) {
      taskInstance.url = task.url;
    }
    if (_.get(task, "metadata")) {
      taskInstance.metadata = task.metadata;
    }
    if (_.get(task, "dataset")) {
      taskInstance.dataset = task.dataset;
    }
    if (_.get(task, "system.state")) {
      taskInstance.system_state = task.system.state;
    }
    if (_.get(task, "system.securityKey")) {
      taskInstance.system_security_key =
        task.system.securityKey;
    }
    if (_.get(task, "system.created")) {
      taskInstance.system_created_at = task.system.created;
    }
    if (_.get(task, "system.modified")) {
      taskInstance.system_modified_at = task.system.modified;
    }
    if (_.get(task, "system.startedAt")) {
      taskInstance.system_started_at = task.system.startedAt;
    }
    if (_.get(task, "system.endedAt")) {
      taskInstance.system_ended_at = task.system.endedAt;
    }
    if (_.get(task, "system.producer.globalId")) {
      taskInstance.system_producer_global_id =
        task.system.producer.globalId;
    }
    if (_.get(task, "system.producer.type")) {
      taskInstance.system_producer_type = task.system.producer.type;
    }
    if (_.get(task, "system.producer.retryTimes")) {
      taskInstance.system_producer_retry_times =
        task.system.producer.retryTimes;
    }
    if (_.get(task, "system.producer.startedAt")) {
      taskInstance.system_producer_started_at =
        task.system.producer.startedAt;
    }
    if (_.get(task, "system.producer.endedAt")) {
      taskInstance.system_producer_ended_at =
        task.system.producer.endedAt;
    }
    if (_.get(task, "system.version")) {
      taskInstance.system_version = task.system.version;
    }
    if (_.get(task, "system.failuresNumber")) {
      taskInstance.system_failures_number =
        task.system.failuresNumber;
    }
    if (_.get(task, "system.failuresReason")) {
      taskInstance.system_failures_reason =
        task.system.failuresReason;
    }

    return taskInstance;
  }
  if (_.isArray(tasks)) {
    let arr = [];
    for (let i = 0; i < tasks.length; i++) {
      arr.push(
        objectToTasks(
          tasks[i],
          taskInstances && taskInstances[i]
        )
      );
    }
    return arr;
  } else {
    return objectToTasks(tasks, taskInstances);
  }
}

export async function addTasksDB(tasks) {
  try {
    const repo = getRepository(Task);
    let taskInstances: any = objectsToTasks(
      tasks,
      null
    );
    let generatedMaps = [];
    // everytime insert 5 items
    while (taskInstances.length) {
      let insertData = taskInstances.splice(0, 5);
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
      "TaskAndHistory.ctrl->addTasksDB"
    );
    logger.error(`addTasksDB fail ${error.message}`, {
      error,
      parameters: {
        tasks,
      },
    });
    throw error;
  }
}

export async function getTasksOrHistoryForManagementDB(
  cursor: string,
  url: string,
  state: string,
  limit: number,
  securityKey: string,
  history?: boolean,
  ids?: string[]
) {
  try {
    let modified: any, id: string, tasks: object[], total: number;
    if (limit) {
      limit = limit * 1;
    }
    let repoName = Task;
    if (history) {
      repoName = TaskHistory;
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
      tasks = await repo.find(nQuery);
    } else {
      const taskQuery = await getRepository(
        repoName
      ).createQueryBuilder("task");
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
        taskQuery[
          funName
        ]("task.system_security_key = :securityKey", { securityKey });
      }

      if (url) {
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        taskQuery[funName]("task.url LIKE :url", {
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
        taskQuery[funName](
          "task.system_state IN (:...states)",
          {
            states,
          }
        );
      }

      if (ids && ids.length) {
        taskQuery.where("task.global_id IN (:...ids)", {
          ids,
        });
      }

      total = await taskQuery.getCount();
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
        taskQuery.limit(limit);
      }
      taskQuery.orderBy({ system_modified_at: "DESC", id: "DESC" });
      if (modified && id) {
        modified = modified * 1;
        let funName: string;
        if (andWhere) {
          funName = "andWhere";
        } else {
          funName = "where";
          andWhere = true;
        }
        taskQuery[
          funName
        ](
          "task.system_modified_at < :modified OR (task.system_modified_at = :modified AND task.id < :id)",
          { modified, id }
        );
      }

      tasks = await taskQuery.getMany();
    }
    const lastItem: any = tasks[tasks.length - 1];
    let nextCursor = null;
    if (lastItem && tasks.length >= limit) {
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
      tasks: flattenToObject(tasks),
      total: total,
    };
  } catch (err) {
    const error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->getTasksForManagementDB"
    );
    logger.error(`getTasksForManagementDB fail ${error.message}`, {
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

// Update all matched tasks' retailer state
export async function updateTasksRetailerStateForManagementDB(
  retailerGID: string,
  state: string,
  dontUpdateModified?: boolean
) {
  try {
    state = _.toUpper(state);
    if (isMongo()) {
      const repo = await getMongoRepository(Task);
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
      const taskQuery = await getRepository(Task)
        .createQueryBuilder("task")
        .update(Task)
        .set(updateData)
        .where("task.retailer_global_id = :id", {
          id: retailerGID,
        });
      return await taskQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->updateTasksRetailerStateForManagementDB"
    );
    logger.error(
      `updateTasksRetailerStateForManagementDB, error:${error.message}`,
      { error }
    );
    throw error;
  }
}

export async function updateTasksStateForManagementDB(
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
    let states = [TASK_STATE.draft, state];
    if (
      state === TASK_STATE.configured ||
      state === TASK_STATE.paused
    ) {
      states.push(TASK_STATE.running);
    }

    if (isMongo()) {
      const repo = await getMongoRepository(Task);
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
        query.system_state.$in = [TASK_STATE.running];
        query.system_started_at = {
          $lt: timeoutStartedAt,
        };
        mongoDBUdpateData.$set.system_producer_ended_at = Date.now();
        mongoDBUdpateData.$set.system_ended_at = Date.now();
        mongoDBUdpateData.$set.system_state = TASK_STATE.timeout;
        mongoDBUdpateData.$set.system_failures_reason =
          "Producer collect task timeout. Engine automatically set to TIMEOUT status";
        // Since this is set by system, so don't auto increase fail number
        // Actually, it isn't easy to auto increase `system_failures_number` ^_^
      }

      return await repo.updateMany(query, mongoDBUdpateData);
    } else {
      // SQL
      const taskQuery = getRepository(Task)
        .createQueryBuilder("task")
        .update(Task);

      const sqlUpdateData: any = {
        system_state: state,
      };

      if(!dontUpdateModified){
        // if `dontUpdateModified` is true, then don't udpate modified, otherwise, update modified
        // The reason of `dontUpdateModified` is when interval check task status or retailer services status, if update `system_modified_at` will cause pagination doesn't work
        sqlUpdateData.system_modified_at = () => Date.now().toString();
      }

      taskQuery.where("task.system_state NOT IN (:...states)", {
        states,
      });

      if (securityKey) {
        taskQuery.andWhere(
          "task.system_security_key = :securityKey",
          { securityKey }
        );
      }

      if (ids && ids.length) {
        taskQuery.andWhere("task.global_id IN (:...ids)", {
          ids,
        });
      }

      if (url) {
        taskQuery.andWhere("task.url LIKE :url", {
          url: `%${url}%`,
        });
      }

      if (selectedState) {
        taskQuery.andWhere(
          "task.system_state IN (:...selectedState)",
          {
            selectedState: selectedState.split(","),
          }
        );
      }

      if (timeoutStartedAt) {
        taskQuery.andWhere(
          "task.system_started_at < :timeoutStartedAt",
          { timeoutStartedAt }
        );
        taskQuery.andWhere(
          "task.system_state IN (:...requiredStates)",
          {
            requiredStates: [TASK_STATE.running],
          }
        );
        sqlUpdateData.system_producer_ended_at = Date.now();
        sqlUpdateData.system_ended_at = Date.now();
        sqlUpdateData.system_state = TASK_STATE.timeout;
        sqlUpdateData.system_failures_reason =
          "Producer collect task timeout. Engine automatically set to TIMEOUT status";
      }

      taskQuery.set(sqlUpdateData);
      return await taskQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->updateTasksStateForManagementDB"
    );
    logger.error(
      `updateTasksStateForManagementDB, error: ${error.message}`,
      { error }
    );
    throw error;
  }
}

export async function deleteTasksOrHistoryForManagementDB(
  url: string,
  selectedState: string,
  ids: string[],
  securityKey: string,
  history?: boolean
) {
  try {
    let repoName = Task;
    if (history) {
      repoName = TaskHistory;
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
      const taskQuery = await getRepository(repoName)
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
        taskQuery[funName]("system_security_key = :securityKey", {
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
        taskQuery[funName]("global_id IN (:...ids)", {
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
        taskQuery[funName]("url LIKE :url", {
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
        taskQuery[funName](
          "task.system_state IN (:...states)",
          {
            states: selectedState.split(","),
          }
        );
      }
      return await taskQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->deleteTasksForManagementDB"
    );
    logger.error(`deleteTasksForManagementDB, error:${error.message}`, {
      error,
    });
    throw error;
  }
}

export async function deleteTasksByRetailerForManagementDB(
  retailerGID: string,
  securityKey: string
) {
  try {
    if (isMongo()) {
      const repo = await getMongoRepository(Task);
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
      const taskQuery = await getRepository(Task)
        .createQueryBuilder("task")
        .delete()
        .from(Task)
        .where("task.retailer_global_id = :id", {
          id: retailerGID,
        });

      if (securityKey) {
        taskQuery.andWhere(
          "task.system_security_key = :securityKey",
          { securityKey }
        );
      }

      return await taskQuery.execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->deleteTasksByRetailerForManagementDB"
    );
    logger.error(
      `deleteTasksByRetailerForManagementDB, error:${error.message}`,
      { error }
    );
    throw error;
  }
}

export async function getTasksForProducerDB(
  producerConfig: any,
  securityKey: string
) {
  try {
    let tasks = [];
    let concurrent = Number(producerConfig.concurrent);
    if (isNaN(concurrent)) {
      // if concurrent isn't a number, then use default value
      concurrent = getConfig("EACH_TIME_TASKS_NUMBER");
    }
    let permission = PERMISSIONS.private;
    if (!producerConfig.private) {
      permission = PERMISSIONS.public;
    }
    let repo;
    // logger.debug("getTasksForProducerDB->producerConfig: %s", producerConfig);
    // logger.debug("getTasksForProducerDB->securityKey: %s", securityKey);
    if (isMongo()) {
      repo = await getMongoRepository(Task);
      let query: any = {
        where: {},
      };
      query.where.system_state = {
        $nin: [
          TASK_STATE.draft,
          TASK_STATE.running,
          TASK_STATE.finished,
          TASK_STATE.paused,
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

      // logger.debug("getTasksForProducerDB->query", query);

      // if security key provide, get all tasks for this security key first
      if (securityKey) {
        query.where.system_security_key = securityKey;
        tasks = await repo.find(query);
        // if permission doesn't exit or producer is public then try to see any public tasks need to collect
        if (
          (!permission || _.upperCase(permission) === PERMISSIONS.public) &&
          (!tasks || !tasks.length)
        ) {
          // if no tasks for this securityKey and if this producer's permission is public then, get other tasks that is public
          delete query.where.system_security_key;
          query.where.permission = {
            $nin: [PERMISSIONS.private],
          };

          tasks = await repo.find(query);
        }
      } else {
        // if securityKey is empty, this means it is on-primse mode, if a request was sent by UI Server, it always contains a securityKey, only if this request is directly sent to
        // DIA-Engine, then it possible don't have securityKey, in this mode, then it should be able to get all permissions tasks since they are belong to same user
        tasks = await repo.find(query);
      }
    } else {
      // SQL
      const taskQuery = await getRepository(
        Task
      ).createQueryBuilder("task");

      const taskQueryNoSecurityKey = await getRepository(
        Task
      ).createQueryBuilder("task");

      taskQuery.where("task.system_state NOT IN (:...states)", {
        states: [
          TASK_STATE.draft,
          TASK_STATE.running,
          TASK_STATE.finished,
          TASK_STATE.paused,
        ],
      });
      taskQuery.andWhere("task.retailer_state = :state", {
        state: RETAILER_STATE.active,
      });
      taskQuery.andWhere(
        "task.suitable_producers LIKE :producerType",
        { producerType: `%${_.toUpper(producerConfig.type)}%` }
      );
      taskQuery.orderBy({
        retailer_global_id: "DESC",
        priority: "ASC",
      });
      taskQuery.limit(concurrent);

      taskQueryNoSecurityKey.where(
        "task.system_state NOT IN (:...states)",
        {
          states: [
            TASK_STATE.draft,
            TASK_STATE.running,
            TASK_STATE.finished,
            TASK_STATE.paused,
          ],
        }
      );
      taskQueryNoSecurityKey.andWhere(
        "task.retailer_state = :state",
        {
          state: RETAILER_STATE.active,
        }
      );
      taskQueryNoSecurityKey.andWhere(
        "task.suitable_producers LIKE :producerType",
        { producerType: `%${_.toUpper(producerConfig.type)}%` }
      );
      taskQueryNoSecurityKey.orderBy({
        retailer_global_id: "DESC",
        priority: "ASC",
      });
      taskQueryNoSecurityKey.limit(concurrent);
      // if security key provide, get all tasks for this security key first
      if (securityKey) {
        taskQuery.andWhere(
          "task.system_security_key = :securityKey",
          { securityKey }
        );
        tasks = await taskQuery.getMany();

        if (
          (!permission || _.upperCase(permission) === PERMISSIONS.public) &&
          (!tasks || !tasks.length)
        ) {
          // if no tasks for this securityKey and if this producer's permission is public then, get other tasks that is public
          taskQueryNoSecurityKey.andWhere(
            "task.permission NOT IN (:...permissions)",
            {
              permissions: [PERMISSIONS.private],
            }
          );
          tasks = await taskQueryNoSecurityKey.getMany();
        }
      } else {
        // if securityKey is empty, this means it is on-primse mode, if a request was sent by UI Server, it always contains a securityKey, only if this request is directly sent to
        // DIA-Engine, then it possible don't have securityKey, in this mode, then it should be able to get all permissions tasks since they are belong to same user
        tasks = await taskQuery.getMany();
      }
    }

    tasks = flattenToObject(tasks);

    let gids = [];
    let retailers = {};
    for (let i = 0; i < tasks.length; i++) {
      let item = tasks[i] || {};
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
      // Reason: Since this task is reassigned, so it always need to update producer information
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
      system_state: TASK_STATE.running,
      system_producer_global_id: producerConfig.globalId,
      system_producer_type: _.toUpper(producerConfig.type),
    };

    if (isMongo()) {
      // Update tasks that return to producer
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
      let query = await getRepository(Task)
        .createQueryBuilder("task")
        .update(Task)
        .set(updateData);
      query.where("task.global_id IN (:...gids)", {
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

    // TODO: 2019/11/10 need to rethink about this logic, since tasks already send back to producers
    //        if we check for now, it is meaningless, better way is let producer to tell. For example, if collect
    //        tasks fail, then check Retailer or direct know retailer is inactive

    // Check Retailer status in parallel
    // // After get tasks that need to collect, during sametime to check whether this Retailer is active.
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
    return tasks;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->getTasksForProducerDB"
    );
    logger.error(`getTasksForProducerDB, error:${error.message}`, {
      error,
    });
    throw error;
  }
}

/**
 * Get tasks by globalIds
 * @param gids - tasks globalId
 * @param securityKey - security key
 */
export async function getTasksDB(gids: string[], securityKey: string) {
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
      const repo = await getMongoRepository(Task);
      let tasks = await repo.find(query);
      tasks = flattenToObject(tasks);
      return tasks;
    } else {
      // sql
      const taskQuery = await getRepository(
        Task
      ).createQueryBuilder("task");
      taskQuery.where("task.global_id IN (:...gids)", { gids });
      if (securityKey) {
        taskQuery.andWhere(
          "task.system_security_key = :securityKey",
          { securityKey }
        );
      }

      let tasks = await taskQuery.getMany();
      tasks = flattenToObject(tasks);
      return tasks;
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->getTasksDB"
    );
    logger.error(`getTasksDB, error:${error.message}`, { error });
    throw error;
  }
}

export async function deleteTasksDB(
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
      const repo = getMongoRepository(Task);
      return await repo.deleteMany(query);
    } else {
      return await getRepository(Task)
        .createQueryBuilder("task")
        .delete()
        .where("task.global_id IN (:...gids)", { gids })
        .execute();
    }
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TaskAndHistory.ctrl->deleteTasksDB"
    );
    logger.error(`deleteTasksDB, error:${error.message}`, { error });
    throw error;
  }
}
/**
 * Update tasks one by one
 * Used for the updating information for each tasks is different
 * @param tasks{object[]}
 */
export async function updateEachTasksDB(tasks: any[]) {
  try {
    let repo;
    if (isMongo()) {
      repo = getMongoRepository(Task);
    } else {
      repo = getRepository(Task);
    }
    for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      task = objectsToTasks(task, {});
      if (isMongo()) {
        logger.debug(`updateEachTasksDB->isMongo`, {
          i,
          global_id: task.global_id,
        });
        await repo.updateOne(
          {
            global_id: task.global_id,
          },
          {
            $set: task,
          }
        );
      } else {
        logger.debug(`updateEachTasksDB->sqlite`, {
          i,
          global_id: task.global_id,
        });
        await repo
          .createQueryBuilder("task")
          .update(Task)
          .set(task)
          .where("task.global_id = :gloalId", {
            gloalId: task.global_id,
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
      "TaskAndHistory.ctrl->updateEachTasksDB"
    );
    logger.error(`updateEachTasksDB fail ${error.message}`, {
      error,
    });
    throw error;
  }
}

export async function addTaskHistoryDB(tasks) {
  try {
    const repo = getRepository(TaskHistory);
    let taskInstances: any = objectsToTasks(
      tasks,
      null
    );
    let generatedMaps = [];
    // everytime insert 10 items
    while (taskInstances.length) {
      let insertData = taskInstances.splice(0, 10);
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
      "TaskHistory.ctrl->addTaskHistoryDB"
    );
    logger.error(`addTaskHistoryDB, error:${error.message}`, { error });
    throw error;
  }
}
