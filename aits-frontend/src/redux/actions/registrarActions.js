// src/redux/actions/registrarActions.js
import axios from 'axios';

// Action Types
export const FETCH_ISSUES_REQUEST = 'FETCH_ISSUES_REQUEST';
export const FETCH_ISSUES_SUCCESS = 'FETCH_ISSUES_SUCCESS';
export const FETCH_ISSUES_FAILURE = 'FETCH_ISSUES_FAILURE';

export const ASSIGN_ISSUE_REQUEST = 'ASSIGN_ISSUE_REQUEST';
export const ASSIGN_ISSUE_SUCCESS = 'ASSIGN_ISSUE_SUCCESS';
export const ASSIGN_ISSUE_FAILURE = 'ASSIGN_ISSUE_FAILURE';

export const REGISTRAR_DATA_REQUEST = 'REGISTRAR_DATA_REQUEST';
export const REGISTRAR_DATA_SUCCESS = 'REGISTRAR_DATA_SUCCESS';
export const REGISTRAR_DATA_FAILURE = 'REGISTRAR_DATA_FAILURE';

// Fetch all academic issues
export const fetchAllIssues = () => async (dispatch) => {
  dispatch(fetchIssuesRequest());
  
  try {
    const response = await axios.get('/api/registrar/issues');
    dispatch(fetchIssuesSuccess(response.data));
  } catch (error) {
    dispatch(fetchIssuesFailure(error.response?.data?.message || 'Failed to fetch issues'));
  }
};

// Action Creators for fetchAllIssues
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

// Assign an issue to a specific lecturer or staff
export const assignIssue = (issueId, assignedTo) => async (dispatch) => {
  dispatch(assignIssueRequest());
  
  try {
    const response = await axios.put(`/api/registrar/issues/${issueId}/assign`, { 
      assigned_to: assignedTo 
    });
    
    dispatch(assignIssueSuccess(response.data));
  } catch (error) {
    dispatch(assignIssueFailure(error.response?.data?.message || 'Failed to assign issue'));
  }
};

// Action Creators for assignIssue
export const assignIssueRequest = () => ({
  type: ASSIGN_ISSUE_REQUEST
});

export const assignIssueSuccess = (issue) => ({
  type: ASSIGN_ISSUE_SUCCESS,
  payload: issue
});

export const assignIssueFailure = (error) => ({
  type: ASSIGN_ISSUE_FAILURE,
  payload: error
});

// Fetch registrar dashboard data
export const fetchRegistrarData = () => async (dispatch) => {
  dispatch(fetchRegistrarDataRequest());
  
  try {
    const response = await axios.get('/api/registrar/dashboard');
    dispatch(fetchRegistrarDataSuccess(response.data));
  } catch (error) {
    dispatch(fetchRegistrarDataFailure(error.response?.data?.message || 'Failed to fetch registrar data'));
  }
};

// Action Creators for fetchRegistrarData
export const fetchRegistrarDataRequest = () => ({
  type: REGISTRAR_DATA_REQUEST
});

export const fetchRegistrarDataSuccess = (data) => ({
  type: REGISTRAR_DATA_SUCCESS,
  payload: data
});

export const fetchRegistrarDataFailure = (error) => ({
  type: REGISTRAR_DATA_FAILURE,
  payload: error
});

// Additional utility actions can be added here
export const filterIssues = (filters) => async (dispatch) => {
  dispatch(fetchIssuesRequest());
  
  try {
    const response = await axios.post('/api/registrar/issues/filter', filters);
    dispatch(fetchIssuesSuccess(response.data));
  } catch (error) {
    dispatch(fetchIssuesFailure(error.response?.data?.message || 'Failed to filter issues'));
  }
};

// Generate a report
export const generateReport = (reportParams) => async () => {
  try {
    const response = await axios.post('/api/registrar/reports', reportParams);
    return response.data;
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
};