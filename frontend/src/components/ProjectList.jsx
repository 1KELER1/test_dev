import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Space } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { getProjects } from '../services/endpoints/projects';

const { Title, Text } = Typography;

const ProjectList = ({ onSendInvitation }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await getProjects();
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="My Projects" loading={loading}>
            <List
                dataSource={projects}
                renderItem={(project) => (
                    <List.Item
                        actions={[
                            <Button
                                type="primary"
                                icon={<TeamOutlined />}
                                onClick={() => onSendInvitation(project.id)}
                            >
                                Invite
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            title={project.name}
                            description={
                                <Space direction="vertical">
                                    <Text>{project.description}</Text>
                                    <Text type="secondary">
                                        Created: {new Date(project.created_at).toLocaleDateString()}
                                    </Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default ProjectList; 