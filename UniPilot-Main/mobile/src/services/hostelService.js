import api from './api';

const hostelService = {
  getGatePasses: async (params = {}) => {
    const response = await api.get('/hostel/gate-pass', { params });
    return response;
  },

  createGatePass: async data => {
    const response = await api.post('/hostel/gate-pass', data);
    return response;
  },

  verifyGatePassOtp: async (id, otp) => {
    const response = await api.post(`/hostel/gate-pass/${id}/verify`, { otp });
    return response;
  },

  rejectGatePass: async (id, remarks) => {
    const response = await api.post(`/hostel/gate-pass/${id}/reject`, {
      remarks,
    });
    return response;
  },

  getComplaints: async (params = {}) => {
    const response = await api.get('/hostel/complaints', { params });
    return response;
  },

  createComplaint: async data => {
    const response = await api.post('/hostel/complaints', data);
    return response;
  },

  updateComplaint: async (id, data) => {
    const response = await api.patch(`/hostel/complaints/${id}`, data);
    return response;
  },
};

export default hostelService;
