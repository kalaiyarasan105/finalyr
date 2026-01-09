import api from './auth';

export const conversationAPI = {
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data;
  },

  getConversation: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  createConversation: async (title = 'New Conversation') => {
    const response = await api.post('/conversations', { title });
    return response.data;
  },

  deleteConversation: async (id) => {
    const response = await api.delete(`/conversations/${id}`);
    return response.data;
  },

  predictEmotion: async (formData) => {
    const response = await api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Legacy endpoint for backward compatibility
  predictMultimodal: async (formData) => {
    const response = await api.post('/predict_multimodal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};