// src/redux/actions/studentActions.js
import { studentService } from '../../services/api';
//import { issueService } from '../../services/api';
//import axios from 'axios';

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

export const fetchIssues = () => async (dispatch) => {
  dispatch({ type: FETCH_ISSUES_REQUEST });
  try {
    const issues = await studentService.getIssues();
    dispatch({ type: FETCH_ISSUES_SUCCESS, payload: issues });
    return issues;
  } catch (error) {
    dispatch({ type: FETCH_ISSUES_FAILURE, payload: error.message });
    throw error;
  }
};

export const fetchAnnouncements = () => async (dispatch) => {
  dispatch({ type: FETCH_ANNOUNCEMENTS_REQUEST });
  try {
    const announcements = await studentService.getAnnouncements();
    dispatch({ type: FETCH_ANNOUNCEMENTS_SUCCESS, payload: announcements });
    return announcements;
  } catch (error) {
    dispatch({ type: FETCH_ANNOUNCEMENTS_FAILURE, payload: error.message });
    throw error;
  }
};

export const fetchStudentData = () => async (dispatch) => {
  dispatch({ type: STUDENT_DATA_REQUEST });
  try {
    const data = await studentService.getProfile();
    dispatch({ type: STUDENT_DATA_SUCCESS, payload: data });
    return  data ;
  } catch (error) {
    dispatch({ type: STUDENT_DATA_FAILURE, payload: error.message });
    throw error;
  }
};

export const createIssue = (issueData) => async (dispatch) => {
  dispatch({ type: CREATE_ISSUE_REQUEST });
  try {
    // Use the studentService method instead of issueService
    const data = await studentService.createIssue(issueData);
    dispatch({ type: CREATE_ISSUE_SUCCESS, payload: data });
    return { payload: data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to create issue';
    dispatch({ type: CREATE_ISSUE_FAILURE, payload: errorMessage });
    throw error;
  }
};