import React from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { ProjectsList } from "./ProjectsList";
import { TeamMembers } from "./TeamMembers";
import { SettingsTeam } from "./SettingsTeam";
import { getProfile } from "../services/endpoints/users";
import { useState, useEffect } from "react";

export function TeamTab({ teamData, setModalIsOpen }) {
  const [activeTab, setActiveTab] = React.useState("Projects");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getProfile();
        console.log("Profile response:", response);
        if (response && response.profile && response.profile.username) {
          setCurrentUser(response.profile.username);
          console.log("Current user set to:", response.profile.username);
        } else {
          console.error("Invalid profile response structure:", response);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  console.log("TeamTab render - currentUser:", currentUser, "teamData:", teamData);

  const data = [
    {
      label: "Проекты",
      value: "Projects",
      desc: (
        <ProjectsList
          teamSlug={teamData.team.slug}
          projects={teamData.projects}
          setModalIsOpen={setModalIsOpen}
        />
      ),
    },
    {
      label: "Участники",
      value: "Members",
      desc: (
        <TeamMembers
          owner={teamData.team.owner}
          members={teamData.team.members}
          teamSlug={teamData.team.slug}
          currentUser={currentUser}
        />
      ),
    },
    {
      label: "Настройки",
      value: "Settings",
      desc: <SettingsTeam teamSlug={teamData.team.slug} owner={teamData.team.owner} />,
    },
  ];

  return (
    <Tabs value={activeTab}>
      <TabsHeader
        className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
        indicatorProps={{
          className:
            "bg-transparent border-b-2 border-blue-500 shadow-none rounded-none",
        }}
      >
        {data.map(({ label, value }) => (
          <Tab
            key={value}
            value={value}
            onClick={() => setActiveTab(value)}
            className={activeTab === value ? "text-blue-500" : ""}
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {data.map(({ value, desc }) => (
          <TabPanel key={value} value={value}>
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}
