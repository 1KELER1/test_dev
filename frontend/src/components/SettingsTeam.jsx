import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { deleteTeam } from "../services/endpoints/teams";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProfile } from "../services/endpoints/users";

export const SettingsTeam = ({ teamSlug, owner }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getProfile();
        if (response && response.profile && response.profile.username) {
          setCurrentUser(response.profile.username);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleDeleteClick = async () => {
      try {
        await deleteTeam(teamSlug);
        navigate("/teams");
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <>
      {currentUser === owner && (
        <>
          <Button color="red" onClick={() => setOpenDeleteDialog(true)}>
            Удалить команду
          </Button>

          <Dialog open={openDeleteDialog} handler={() => setOpenDeleteDialog(false)}>
            <DialogHeader>Подтверждение удаления</DialogHeader>
            <DialogBody>
              Вы уверены, что хотите удалить команду? Это действие нельзя отменить.
            </DialogBody>
            <DialogFooter>
              <Button
                variant="text"
                color="red"
                onClick={() => setOpenDeleteDialog(false)}
                className="mr-1"
              >
                Отмена
              </Button>
              <Button
                variant="gradient"
                color="red"
                onClick={handleDeleteClick}
              >
                Удалить команду
      </Button>
            </DialogFooter>
          </Dialog>
        </>
      )}
    </>
  );
};
