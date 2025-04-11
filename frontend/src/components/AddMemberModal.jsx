import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import { searchUsers } from "../services/endpoints/users";
import { addMember } from "../services/endpoints/teams";

export function AddMemberModal({ isOpen, closeModal, teamSlug }) {
  const [username, setUsername] = useState("");
  const [isUsernameEmpty, setIsUsernameEmpty] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (username.length >= 3) {
      const search = async () => {
        try {
          setLoading(true);
          const results = await searchUsers(username);
          setSearchResults(results);
          setError(null);
        } catch (err) {
          setError("Ошибка при поиске пользователей");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      search();
    } else {
      setSearchResults([]);
    }
  }, [username]);

  const handleAddMember = async (selectedUsername) => {
    try {
      setLoading(true);
      await addMember(teamSlug, { username: selectedUsername });
      setSuccess(true);
      setUsername("");
      setSearchResults([]);
      setTimeout(() => {
        closeModal();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError("Ошибка при добавлении участника");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} handler={closeModal}>
        <DialogHeader>Добавить участника</DialogHeader>
        <DialogBody divider>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsUsernameEmpty(false);
                  setError(null);
                }}
                placeholder="Введите имя пользователя"
                className="border border-gray-400 p-2 rounded-lg w-full"
              />
            </div>
            {isUsernameEmpty && (
              <p className="text-red-600 text-sm">
                Пожалуйста, введите имя пользователя.
              </p>
            )}
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm">
                Приглашение успешно отправлено!
              </p>
            )}
            {loading && (
              <p className="text-gray-600 text-sm">Загрузка...</p>
            )}
            {searchResults.length > 0 && (
              <div className="mt-4">
                <Typography variant="small" color="gray" className="mb-2">
                  Найденные пользователи:
                </Typography>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddMember(user.username)}
                    >
                      <Typography variant="small">
                        {user.username}
                      </Typography>
                      <Button
                        size="sm"
                        color="green"
                        onClick={() => handleAddMember(user.username)}
                      >
                        Добавить
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={closeModal}
            className="mr-1"
          >
            <span>Отмена</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
