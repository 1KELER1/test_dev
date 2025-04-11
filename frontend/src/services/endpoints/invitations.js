import api from '../api';

export const getInvitations = async () => {
    try {
        const response = await api.get('/invitations/');
        return response;
    } catch (error) {
        console.error('Error fetching invitations:', error);
        throw error;
    }
};

export const sendInvitation = async (projectId, userId) => {
    try {
        const response = await api.post('/invitations/', {
            project: projectId,
            recipient: userId
        });
        return response;
    } catch (error) {
        console.error('Error sending invitation:', error);
        throw error;
    }
};

export const acceptInvitation = async (invitationId) => {
    try {
        const response = await api.post(`/invitations/${invitationId}/accept/`);
        return response;
    } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error;
    }
};

export const rejectInvitation = async (invitationId) => {
    try {
        const response = await api.post(`/invitations/${invitationId}/reject/`);
        return response;
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        throw error;
    }
}; 