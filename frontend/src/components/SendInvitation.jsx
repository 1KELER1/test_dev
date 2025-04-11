import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { searchUsers } from '../services/endpoints/users';
import { sendInvitation } from '../services/endpoints/invitations';

const { Option } = Select;

const SendInvitation = ({ projectId, visible, onCancel }) => {
    const [form] = Form.useForm();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (value) => {
        if (value.length < 3) return;
        try {
            const data = await searchUsers(value);
            setUsers(data);
        } catch (error) {
            console.error('Error searching users:', error);
            message.error('Failed to search users');
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await sendInvitation(projectId, values.userId);
            message.success('Invitation sent successfully');
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Error sending invitation:', error);
            message.error('Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Send Team Invitation"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
            >
                <Form.Item
                    name="userId"
                    label="Select User"
                    rules={[{ required: true, message: 'Please select a user' }]}
                >
                    <Select
                        showSearch
                        placeholder="Search users"
                        onSearch={handleSearch}
                        filterOption={false}
                        loading={loading}
                    >
                        {users.map(user => (
                            <Option key={user.id} value={user.id}>
                                {user.username}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Send Invitation
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SendInvitation; 