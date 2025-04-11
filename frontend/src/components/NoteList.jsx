import {
  PencilIcon,
  UserCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { Chip, IconButton } from "@material-tailwind/react";
import { useState } from "react";
import { CreateItem } from "./CreateItem";
import { createNote, deleteNote, editNote } from "../services/endpoints/notes";

export const NoteList = ({ teamSlug, projectId, notes }) => {
  const [updatedNotes, setUpdatedNotes] = useState(notes);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(teamSlug, projectId, noteId);
      setUpdatedNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== noteId)
      );
    } catch (error) {
      console.error("Ошибка при удалении заметки:", error);
    }
  };

  const handleCreateNote = async (name, description) => {
    try {
      const data = { name: name, description: description, project: projectId };
      const response = await createNote(teamSlug, projectId, data);
      if (response && response.data) {
        setUpdatedNotes((prevNotes) => [response.data, ...prevNotes]);
      }
    } catch (error) {
      console.error("Ошибка при создании заметки:", error);
    }
  };

  const handleEditNote = async (noteId, name, description) => {
    try {
      const data = { name: name, description: description };
      await editNote(teamSlug, projectId, noteId, data);
      setUpdatedNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, name, description } : note
        )
      );
      setEditingNote(null);
    } catch (error) {
      console.error("Ошибка при редактировании заметки:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {updatedNotes.map((note) => (
        <div
          key={note.id}
          className="border border-gray-300 p-4 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold mb-2">{note.name}</h3>
          <div className="mb-4">
            <p className="text-gray-600">{note.description}</p>
          </div>
          <div className="flex items-center mb-2 gap-2">
            <Chip
              value={note.owner}
              variant="filled"
              color="blue"
              icon={<UserCircleIcon className="h-5 w-5" />}
            />
            <IconButton
              variant="outlined"
              size="sm"
              color="red"
              onClick={() => handleDeleteNote(note.id)}
            >
              <TrashIcon className="h-3 w-3" />
            </IconButton>
            <IconButton
              variant="outlined"
              size="sm"
              color="blue"
              onClick={() => setEditingNote(note)}
            >
              <PencilIcon className="h-3 w-3" />
            </IconButton>
          </div>
        </div>
      ))}

      <div
        className="flex flex-col items-center justify-center border border-gray-300 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition duration-300"
        onClick={() => setModalIsOpen(true)}
      >
        <div className="flex items-center justify-center">
          <PlusIcon className="h-6 w-6 text-blue-500" />
        </div>
        <div className="mt-2 text-center">
          <p className="text-blue-500 font-semibold">Добавить новую заметку</p>
        </div>
      </div>

      <CreateItem
        isOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
        createHandler={handleCreateNote}
        createdItem="note"
      />

      {editingNote && (
        <CreateItem
          isOpen={true}
          closeModal={() => setEditingNote(null)}
          createHandler={(name, description) =>
            handleEditNote(editingNote.id, name, description)
          }
          createdItem="note"
          initialName={editingNote.name}
          initialDescription={editingNote.description}
        />
      )}
    </div>
  );
};
