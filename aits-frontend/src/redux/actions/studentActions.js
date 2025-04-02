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



export const createIssue = (issueData, token) => async (dispatch) => {
  dispatch(createIssueRequest());
  try {
    console.log("Action received data:", issueData);
    console.log("Using token:", token);
    
    const response = await axios.post('/api/create-issue/', issueData, {
      headers: { Authorization: `Bearer ${token.access}` }
    });
    
    console.log("API response:", response.data);
    dispatch(createIssueSuccess(response.data));
    return { payload: response.data };  // Return consistent with your component expectation
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    dispatch(createIssueFailure(error.message));
    throw error;
  }
};