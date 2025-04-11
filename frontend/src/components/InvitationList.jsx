import React, { useState, useEffect } from 'react';
import { getInvitations, acceptInvitation, rejectInvitation } from '../services/endpoints/invitations';
import { Card, List, Button, Typography, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const InvitationList = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const response = await getInvitations();
            setInvitations(response.data);
        } catch (error) {
            console.error('Error fetching invitations:', error);
            message.error('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (invitationId) => {
        try {
            await acceptInvitation(invitationId);
            message.success('Invitation accepted successfully');
            fetchInvitations();
        } catch (error) {
            console.error('Error accepting invitation:', error);
            message.error('Failed to accept invitation');
        }
    };

    const handleReject = async (invitationId) => {
        try {
            await rejectInvitation(invitationId);
            message.success('Invitation rejected successfully');
            fetchInvitations();
        } catch (error) {
            console.error('Error rejecting invitation:', error);
            message.error('Failed to reject invitation');
        }
    };

    return (
        <Card title="Team Invitations" loading={loading}>
            <List
                dataSource={invitations}
                renderItem={(invitation) => (
                    <List.Item
                        actions={[
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleAccept(invitation.id)}
                            >
                                Accept
                            </Button>,
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => handleReject(invitation.id)}
                            >
                                Reject
                            </Button>
                        ]}
                    >
                        <List.Item.Meta
                            title={`Invitation to join ${invitation.project.name}`}
                            description={
                                <Space direction="vertical">
                                    <Text>From: {invitation.sender.username}</Text>
                                    <Text type="secondary">
                                        Sent: {new Date(invitation.created_at).toLocaleDateString()}
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

export default InvitationList; 