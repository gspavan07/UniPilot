import api from './api';

export const placementService = {
  // Student - Fetch common dashboard data (Applications, offers, etc.)
  getPlacementStats: async () => {
    try {
      const [eligibleDrives, myApplications, myOffers, myProfile] =
        await Promise.all([
          api.get('/placement/eligible-drives'),
          api.get('/placement/my-applications'),
          api.get('/placement/my-offers'),
          api.get('/placement/my-profile'),
        ]);

      return {
        eligibleDrives: eligibleDrives?.data || [],
        myApplications: myApplications?.data || [],
        myOffers: myOffers?.data || [],
        myProfile: myProfile?.data || null,
        success: true,
      };
    } catch (error) {
      console.error('Placement stats error:', error);
      throw error;
    }
  },

  getEligibleDrives: async () => {
    try {
      return await api.get('/placement/eligible-drives');
    } catch (error) {
      throw error;
    }
  },

  getMyApplications: async () => {
    try {
      return await api.get('/placement/my-applications');
    } catch (error) {
      throw error;
    }
  },

  getDriveDetails: async driveId => {
    try {
      return await api.get(`/placement/drives/${driveId}`);
    } catch (error) {
      throw error;
    }
  },

  getPlacementProfile: async () => {
    try {
      return await api.get('/placement/my-profile');
    } catch (error) {
      throw error;
    }
  },

  updatePlacementProfile: async profileData => {
    try {
      return await api.post('/placement/my-profile', profileData);
    } catch (error) {
      throw error;
    }
  },

  applyToDrive: async (driveId, registrationFormData) => {
    try {
      return await api.post('/placement/apply', {
        driveId,
        registrationFormData,
      });
    } catch (error) {
      throw error;
    }
  },

  uploadResume: async formData => {
    try {
      return await api.post('/placement/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw error;
    }
  },

  getSystemFields: async () => {
    try {
      return await api.get('/placement/system-fields');
    } catch (error) {
      throw error;
    }
  },
};

export default placementService;
