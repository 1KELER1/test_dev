import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Card } from "@material-tailwind/react";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { CreateItem } from "./CreateItem";
import { getProject } from "../services/endpoints/projects";
import { SendInvitation } from "./SendInvitation";
import { InvitationList } from "./InvitationList";

export const ProjectPage = () => {
  const { teamSlug, projectId } = useParams();
  const [project, setProject] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [createdItem, setCreatedItem] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProject(teamSlug, projectId);
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [teamSlug, projectId]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Typography variant="h2" className="mb-2">
            {project.name}
          </Typography>
          <Typography variant="paragraph" color="gray">
            {project.description}
          </Typography>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCreatedItem("task");
              setModalIsOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Task
          </button>
          <button
            onClick={() => {
              setCreatedItem("note");
              setModalIsOpen(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Note
          </button>
          <button
            onClick={() => setShowInviteDialog(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Invite Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-4">
          <Typography variant="h4" className="mb-4">
            Tasks
          </Typography>
          <TaskList
            teamSlug={teamSlug}
            projectId={projectId}
            tasks={project.tasks}
          />
        </Card>

        <Card className="p-4">
          <Typography variant="h4" className="mb-4">
            Notes
          </Typography>
          <NoteList
            teamSlug={teamSlug}
            projectId={projectId}
            notes={project.notes}
          />
        </Card>
      </div>

      <CreateItem
        isOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
        createHandler={(name, description) => {
          if (createdItem === "task") {
            // Handle task creation
          } else if (createdItem === "note") {
            // Handle note creation
          }
        }}
        createdItem={createdItem}
      />

      <SendInvitation
        teamId={project.team}
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
      />

      <div className="mt-8">
        <Typography variant="h4" className="mb-4">
          Invitations
        </Typography>
        <InvitationList />
      </div>
    </div>
  );
}; 