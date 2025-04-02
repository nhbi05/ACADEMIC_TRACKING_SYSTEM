// src/redux/actions/studentActions.js
import { studentService } from '../../services/api';
import axios from 'axios';

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

export const CREATE_ISSUE_REQUEST = 'CREATE_ISSUE_REQUEST';
export const CREATE_ISSUE_SUCCESS = 'CREATE_ISSUE_SUCCESS';
export const CREATE_ISSUE_FAILURE = 'CREATE_ISSUE_FAILURE';

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

export const createIssueRequest = () => ({
  type: CREATE_ISSUE_REQUEST
});

export const createIssueSuccess = (issue) => ({
  type: CREATE_ISSUE_SUCCESS,
  payload: issue
});

export const createIssueFailure = (error) => ({
  type: CREATE_ISSUE_FAILURE,
  payload: error
});

// Thunk Action Creators
export const fetchStudentData = () => async (dispatch, getState) => {
  dispatch(fetchStudentDataRequest());
  
  try {
    // Get token from Redux store
    const { tokens } = getState().auth;
    if (!tokens || !tokens.access) {
      throw new Error('No access token available');
    }
    
    // Make sure API has the token
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    
    const data = await studentService.getProfile();
    dispatch(fetchStudentDataSuccess(data));
    return data;
  } catch (error) {
    dispatch(fetchStudentDataFailure(error.message || 'Failed to fetch student data'));
    throw error;
  }
};

export const fetchIssues = () => async (dispatch, getState) => {
  dispatch(fetchIssuesRequest());
  
  try {
    // Get token from Redux store
    const { tokens } = getState().auth;
    if (!tokens || !tokens.access) {
      throw new Error('No access token available');
    }
    
    // Make sure API has the token
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    
    const response = await studentService.getIssues();
    dispatch(fetchIssuesSuccess(response));
    return response;
  } catch (error) {
    dispatch(fetchIssuesFailure(error.message || 'Failed to fetch issues'));
    throw error;
  }
};

export const fetchAnnouncements = () => async (dispatch, getState) => {
  dispatch(fetchAnnouncementsRequest());
  
  try {
    // Get token from Redux store
    const { tokens } = getState().auth;
    if (!tokens || !tokens.access) {
      throw new Error('No access token available');
    }
    
    // Make sure API has the token
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    
    const response = await studentService.getAnnouncements();
    dispatch(fetchAnnouncementsSuccess(response));
    return response;
  } catch (error) {
    dispatch(fetchAnnouncementsFailure(error.message || 'Failed to fetch announcements'));
    throw error;
  }
};

export const createIssue = (issueData, tokens) => async (dispatch) => {
  dispatch(createIssueRequest());
  
  try {
    console.log("Action received data:", issueData);
    
    if (!tokens || !tokens.access) {
      throw new Error('No access token available');
    }
    
    console.log("Using token:", tokens.access);
    
    const response = await axios.post('/submit-issue/', issueData, {
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    
    console.log("API response:", response.data);
    dispatch(createIssueSuccess(response.data));
    return { payload: response.data };
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create issue';
    dispatch(createIssueFailure(errorMessage));
    // Rethrow to allow component to handle
    throw error;
  }
};