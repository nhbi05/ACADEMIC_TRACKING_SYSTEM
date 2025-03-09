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
  type: STUDENT_DATA_REQUEST
});

export const fetchStudentDataSuccess = (data) => ({
  type: STUDENT_DATA_SUCCESS,
  payload: data
});

export const fetchStudentDataFailure = (error) => ({
  type: STUDENT_DATA_FAILURE,
  payload: error
});

export const fetchIssuesRequest = () => ({
  type: FETCH_ISSUES_REQUEST
});

export const fetchIssuesSuccess = (issues) => ({
  type: FETCH_ISSUES_SUCCESS,
  payload: issues
});

export const fetchIssuesFailure = (error) => ({
  type: FETCH_ISSUES_FAILURE,
  payload: error
});

export const fetchAnnouncementsRequest = () => ({
  type: FETCH_ANNOUNCEMENTS_REQUEST
});

export const fetchAnnouncementsSuccess = (announcements) => ({
  type: FETCH_ANNOUNCEMENTS_SUCCESS,
  payload: announcements
});

export const fetchAnnouncementsFailure = (error) => ({
  type: FETCH_ANNOUNCEMENTS_FAILURE,
  payload: error
});

// Thunk action creators
export const fetchStudentData = () => async (dispatch, getState) => {
  dispatch(fetchStudentDataRequest());
  
  try {
    const { auth } = getState();
    const response = await studentService.getProfile(auth.tokens.access);
    
    dispatch(fetchStudentDataSuccess(response));
    return { success: true };
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch student data';
    dispatch(fetchStudentDataFailure(errorMessage));
    return { success: false };
  }
};

export const fetchIssues = () => async (dispatch, getState) => {
  dispatch(fetchIssuesRequest());
  
  try {
    const { auth } = getState();
    const response = await studentService.getIssues(auth.tokens.access);
    
    dispatch(fetchIssuesSuccess(response));
    return { success: true };
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch issues';
    dispatch(fetchIssuesFailure(errorMessage));
    return { success: false };
  }
};

export const fetchAnnouncements = () => async (dispatch, getState) => {
  dispatch(fetchAnnouncementsRequest());
  
  try {
    const { auth } = getState();
    const response = await studentService.getAnnouncements(auth.tokens.access);
    
    dispatch(fetchAnnouncementsSuccess(response));
    return { success: true };
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch announcements';
    dispatch(fetchAnnouncementsFailure(errorMessage));
    return { success: false };
  }
};