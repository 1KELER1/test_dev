import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { createProject } from '../services/endpoints/projects';

const CreateProject = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await createProject(values);
            message.success('Project created successfully');
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Error creating project:', error);
            message.error('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create New Project"
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
                    name="name"
                    label="Project Name"
                    rules={[{ required: true, message: 'Please enter project name' }]}
                >
                    <Input placeholder="Enter project name" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea placeholder="Enter project description" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Create Project
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateProject; 