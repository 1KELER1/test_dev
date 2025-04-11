import { del, post, put } from "../utils/request";

// create note
export const createNote = async (teamSlug, projectID, data) => {
  const route = `team/${teamSlug}/project/${projectID}/note/`;
  return await post(route, data);
};

// edit note
export const editNote = async (teamSlug, projectID, noteId, data) => {
  const route = `team/${teamSlug}/project/${projectID}/note/${noteId}/`;
  return await put(route, data);
};

// delete note
export const deleteNote = async (teamSlug, projectId, noteId) => {
  const route = `team/${teamSlug}/project/${projectId}/note/${noteId}/delete/`;
  return await del(route);
};
