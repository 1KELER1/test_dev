import { Card, Typography, Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { AvatarGen } from "./AvatarGen";
import { removeMember } from "../services/endpoints/teams";
import { useState, useEffect } from "react";
import { getUserById } from "../services/endpoints/users";
import { formatRussianDateTime } from "../utils/dateUtils";

export function TeamMembers({ members, owner, teamSlug, currentUser }) {
  const [membersList, setMembersList] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    console.log("TeamMembers props:", { members, owner, teamSlug, currentUser });
    console.log("Is current user owner?", currentUser === owner);
    
    const fetchMembers = async () => {
      if (members && owner) {
        console.log("Fetching members with IDs:", members);
        const membersWithUsernames = await Promise.all(
          members.map(async (memberId) => {
            try {
              console.log("Fetching user with ID:", memberId);
              const response = await getUserById(memberId);
              console.log("User response:", response);
              // Проверяем разные возможные структуры ответа
              if (response && response.username) {
                return { id: memberId, name: response.username, role: "Member" };
              } else if (response && response.data && response.data.username) {
                return { id: memberId, name: response.data.username, role: "Member" };
              } else if (response && response.profile && response.profile.username) {
                return { id: memberId, name: response.profile.username, role: "Member" };
              } else {
                console.error("Invalid user response structure:", response);
                return { id: memberId, name: `User ${memberId}`, role: "Member" };
              }
            } catch (error) {
              console.error(`Error fetching user ${memberId}:`, error);
              return { id: memberId, name: `User ${memberId}`, role: "Member" };
            }
          })
        );
        
        console.log("Members with usernames:", membersWithUsernames);
        const updatedMembersList = [
          { name: owner, role: "owner" },
          ...membersWithUsernames,
        ];
        console.log("Updated membersList:", updatedMembersList);
        setMembersList(updatedMembersList);
      }
    };

    fetchMembers();
  }, [members, owner, currentUser, teamSlug]);

  const handleRemoveMember = async (member) => {
    try {
      console.log("Removing member:", member);
      await removeMember(teamSlug, { username: member.name });
      setMembersList(membersList.filter(m => m.id !== member.id));
      setOpenDeleteDialog(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleOpenDeleteDialog = (member) => {
    setMemberToDelete(member);
    setOpenDeleteDialog(true);
  };

  console.log("Current membersList:", membersList);
  console.log("Render check - currentUser:", currentUser, "owner:", owner);

  return (
    <>
      <Card className="w-full h-full p-4">
        <Typography variant="h6" color="blue-gray" className="mb-4">
          Участники команды
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {membersList.map((member) => (
            <div key={member.id || member.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-center">
                <AvatarGen username={member.name} className="h-12 w-12 mb-4" />
              </div>
              <Typography
                variant="subtitle2"
                color="blue-gray"
                className="font-semibold"
              >
                {member.name}
              </Typography>
              <Typography variant="caption" color="gray" className="mb-2">
                {member.role}
              </Typography>
              {member.role === "Member" && currentUser === owner && (
                <Button
                  size="sm"
                  color="red"
                  className="mt-2"
                  onClick={() => handleOpenDeleteDialog(member)}
                >
                  Удалить
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={openDeleteDialog} handler={() => setOpenDeleteDialog(false)}>
        <DialogHeader>Подтверждение удаления</DialogHeader>
        <DialogBody>
          Вы уверены, что хотите удалить участника {memberToDelete?.name} из команды?
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
            onClick={() => handleRemoveMember(memberToDelete)}
          >
            Удалить
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
