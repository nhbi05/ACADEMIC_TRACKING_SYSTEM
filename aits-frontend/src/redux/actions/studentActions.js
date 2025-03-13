// src/redux/actions/studentActions.js
import { studentService } from '../../services/api';

// Action Types
export const STUDENT_DATA_REQUEST = 'STUDENT_DATA_REQUEST';
export const STUDENT_DATA_SUCCESS = 'STUDENT_DATA_SUCCESS';
export const STUDENT_DATA_FAILURE = 'STUDENT_DATA_FAILURE';

export const FETCH_ISSUES_REQUEST = 'FETCH_ISSUES_REQUEST';
export const FETCH_ISSUES_SUCCESS = 'FETCH_ISSUES_SUCCESS';
export const FETCH_ISSUES_FAILURE = 'FETCH_ISSUES_FAILURE';

export const FETCH_ANNOUNCEMENTS_REQUEST = 'FETCH_ANNOUNCEMENTS_REQUEST';
export const FETCH_ANNOUNCEMENTS_SUCCESS = 'FETCH_ANNOUNCEMENTS_SUCCESS';
export const FETCH_ANNOUNCEMENTS_FAILURE = 'FETCH_ANNOUNCEMENTS_FAILURE';

// Action Creators
export const fetchStudentDataRequest = () => ({
  type: STUDENT_DATA_REQUEST,
});

export const fetchStudentDataSuccess = (data) => ({
  type: STUDENT_DATA_SUCCESS,
  payload: data,
});

export const fetchStudentDataFailure = (error) => ({
  type: STUDENT_DATA_FAILURE,
  payload: error,
});

export const fetchIssuesRequest = () => ({
  type: FETCH_ISSUES_REQUEST,
});

export const fetchIssuesSuccess = (issues) => ({
  type: FETCH_ISSUES_SUCCESS,
  payload: issues,
});

export const fetchIssuesFailure = (error) => ({
  type: FETCH_ISSUES_FAILURE,
  payload: error,
});

export const fetchAnnouncementsRequest = () => ({
  type: FETCH_ANNOUNCEMENTS_REQUEST,
});

export const fetchAnnouncementsSuccess = (announcements) => ({
  type: FETCH_ANNOUNCEMENTS_SUCCESS,
  payload: announcements,
});

export const fetchAnnouncementsFailure = (error) => ({
  type: FETCH_ANNOUNCEMENTS_FAILURE,
  payload: error,
});

// Thunk Action Creators
export const fetchStudentData = () => async (dispatch) => {
  dispatch(fetchStudentDataRequest());
  
  try {
    const data = await studentService.getProfile();
    dispatch(fetchStudentDataSuccess(data));
    return data;
  } catch (error) {
    dispatch(fetchStudentDataFailure(error.message || 'Failed to fetch student data'));
    throw error;
  }
};

export const fetchIssues = () => async (dispatch) => {
  dispatch(fetchIssuesRequest());
  
  try {
    // This should use the issueService to get student-specific issues
    const response = await studentService.getIssues();
    dispatch(fetchIssuesSuccess(response));
    return response;
  } catch (error) {
    dispatch(fetchIssuesFailure(error.message || 'Failed to fetch issues'));
    throw error;
  }
};

export const fetchAnnouncements = () => async (dispatch) => {
  dispatch(fetchAnnouncementsRequest());
  
  try {
    // This should use a service to get announcements
    const response = await studentService.getAnnouncements();
    dispatch(fetchAnnouncementsSuccess(response));
    return response;
  } catch (error) {
    dispatch(fetchAnnouncementsFailure(error.message || 'Failed to fetch announcements'));
    throw error;
  }
};