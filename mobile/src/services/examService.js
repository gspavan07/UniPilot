import api from './api';
import { Platform, PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ExamService {
  // Get student's exam schedules
  async getMySchedules() {
    const response = await api.get('/exam/my-schedules');
    return response.data;
  }

  // Get available exam cycles
  async getExamCycles() {
    const response = await api.get('/exam/cycles');
    return response.data;
  }

  // Get student's exam registrations
  async getMyRegistrations() {
    const response = await api.get('/exam/my-registrations');
    return response.data;
  }

  // Get registration status for a specific cycle
  async getRegistrationStatus(cycleId) {
    const response = await api.get(`/exam/${cycleId}/status`);
    return response.data;
  }

  // Get backlog courses
  async getBacklogs() {
    const response = await api.get('/exam/backlogs');
    return response.data;
  }

  async _downloadFile(url, fileName, description) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const { baseURL } = api.defaults;

      const downloadDest =
        Platform.OS === 'android'
          ? `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`
          : `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        // On modern Android (10+), WRITE_EXTERNAL_STORAGE might return DENIED but we can still write to Downloads
        // via DownloadManager if notification/description is set. However, for direct path writing, we check.
      }

      const res = await ReactNativeBlobUtil.config({
        path: downloadDest,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: downloadDest,
          description: description,
          mime: 'application/pdf',
        },
      }).fetch('GET', `${baseURL}${url}`, {
        Authorization: `Bearer ${token}`,
      });

      return { success: true, path: res.path() };
    } catch (error) {
      console.error(`Download error for ${fileName}:`, error);
      throw error;
    }
  }

  // Download hall ticket
  async downloadHallTicket(cycleId, cycleName, studentId) {
    const fileName = `HallTicket_${cycleName}_${studentId}.pdf`.replace(
      /\s+/g,
      '_',
    );
    return this._downloadFile(
      `/exam/registration/${cycleId}/download-hall-ticket`,
      fileName,
      'Downloading Hall Ticket',
    );
  }

  // Download receipt
  async downloadReceipt(registrationId, cycleName, registrationIdStr) {
    const fileName = `Receipt_${cycleName}_${registrationIdStr}.pdf`.replace(
      /\s+/g,
      '_',
    );
    return this._downloadFile(
      `/exam/registration/${registrationId}/receipt`,
      fileName,
      'Downloading Receipt',
    );
  }

  // Reverification
  async getEligibleForReverification() {
    const response = await api.get('/exam/my-reverification-eligibility');
    return response.eligibleExams;
  }

  async getReverificationRequests() {
    const response = await api.get('/exam/my-reverification-requests');
    return response.requests;
  }

  // Scripts
  async getMyScripts() {
    const response = await api.get('/exam/my-scripts');
    return response;
  }

  async viewScript(scriptId) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const { baseURL } = api.defaults;
      const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/view_script_${scriptId}.pdf`;

      const res = await ReactNativeBlobUtil.config({
        path: tempPath,
      }).fetch('GET', `${baseURL}/exam/scripts/${scriptId}/view`, {
        Authorization: `Bearer ${token}`,
      });

      return res.path();
    } catch (error) {
      console.error('View script error:', error);
      throw error;
    }
  }

  async downloadScript(scriptId, courseName, courseCode) {
    const fileName = `${courseCode}_${courseName}_AnswerScript.pdf`.replace(
      /\s+/g,
      '_',
    );
    return this._downloadFile(
      `/exam/scripts/${scriptId}/view`,
      fileName,
      'Downloading Answer Script',
    );
  }
}

export default new ExamService();
