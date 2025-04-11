import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

export const CreateItem = ({
  isOpen,
  closeModal,
  createHandler,
  createdItem,
  initialName = "",
  initialDescription = "",
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  const handleSubmit = () => {
    createHandler(name, description);
    setName("");
    setDescription("");
    closeModal();
  };

  return (
    <>
      <Dialog open={isOpen} handler={closeModal}>
        <DialogHeader>
          {initialName ? "Редактирование " : "Создание "}
          {createdItem}
        </DialogHeader>
        <DialogBody divider>
          <input
            type="text"
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={createdItem + " Название"}
          />
          <input
            type="text"
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={createdItem + " Описание"}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={closeModal}
            className="mr-1"
          >
            <span>Отменить</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleSubmit}
          >
            <span>{initialName ? "Сохранить" : "Создать"}</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
