import { getRepository, getMongoRepository, } from "typeorm";
import TasksJobQueue from "../entity/TasksJobQueue";
const logger = require("../util/logger");
const { getConfig } = require("../config");
const { HTTPError } = require("../util/error");
import { isMongo } from "../util/dbConfiguration";

export async function addATaskJob(globalId, agentGlobalId) {
  try {
    const repo = getRepository(TasksJobQueue);
    const job = await repo.save({
      global_id: globalId,
      agent_global_id: agentGlobalId,
    });
    return job;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TasksJobQueue.ctrl->addATaskJob"
    );
    logger.error(`addATaskJob, error:${error.message}`, { error });
    throw error;
  }
}

export async function getTopTaskJob() {
  try {
    // 1. created time
    // 2. id
    // make sure first in, first out
    let repo;
    let job;
    if (isMongo()) {
      repo = await getMongoRepository(TasksJobQueue);
      let query: any = {
        $query: {},
        $orderby: { created_at: 1, _id: 1 },
      };
      job = await repo.findOne(query);
    } else {
      job = await getRepository(TasksJobQueue)
        .createQueryBuilder()
        .orderBy({
          created_at: "ASC",
          id: "ASC",
        })
        .getOne();
    }

    return job;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TasksJobQueue.ctrl->getTopTaskJob"
    );
    logger.error(`getTopTaskJob, error:${error.message}`, { error });
    throw error;
  }
}

export async function removeTimeoutJob() {
  try {
    // only timeout those task that didn't remove after timeout
    let timeoutCreatedAt: any =
      Date.now() - getConfig("TASK_JOB_TIMEOUT") * 1.1;
    timeoutCreatedAt = new Date(timeoutCreatedAt).toISOString();
    logger.info(`Remove all task jobs created before ${timeoutCreatedAt}`, {
      function: "removeTimeoutJob",
    });
    if (isMongo()) {
      await getMongoRepository(TasksJobQueue).deleteMany({
        created_at: {
          $lt: new Date(timeoutCreatedAt),
        },
      });
    } else {
      await getRepository(TasksJobQueue)
        .createQueryBuilder()
        .delete()
        .where("created_at < :timeoutCreatedAt", { timeoutCreatedAt })
        .execute();
    }
  } catch (err) {}
}

export async function removeTaskJob(globalId) {
  try {
    let query: any = {
      global_id: globalId,
    };
    const repo = getRepository(TasksJobQueue);
    let result = await repo.delete(query);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "TasksJobQueue.ctrl->removeTaskJob"
    );
    logger.error(`removeTaskJob, error:${error.message}`, { error });
    throw error;
  }
}
