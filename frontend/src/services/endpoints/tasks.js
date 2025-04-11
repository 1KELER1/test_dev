import { del, post, put } from "../utils/request";

import axios from "axios";

// create project
export const createTask = async (teamSlug, projectID, data) => {
  const route = `team/${teamSlug}/project/${projectID}/task/`;
  return await post(route, data);
};

// edit project
export const editTask = async (teamSlug, projectID, data) => {
  const route = `team/${teamSlug}/project/${projectID}/task/`;
  //return await put(route, data);
};

export const deleteTask = async (teamSlug, projectId, taskId) => {
  const route = `team/${teamSlug}/project/${projectId}/task/${taskId}/delete/`;
  return await del(route);
};
