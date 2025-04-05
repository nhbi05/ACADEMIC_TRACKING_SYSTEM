// src/redux/actions/registrarActions.js
import { registrarService } from '../../services/api';


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

// Action Creators for fetchAllIssues
export const fetchIssuesRequest = () => ({
  type: FETCH_ISSUES_REQUEST
});

export const fetchIssuesSuccess = (data) => ({
  type: FETCH_ISSUES_SUCCESS,
  payload: data
});

export const fetchIssuesFailure = (error) => ({
  type: FETCH_ISSUES_FAILURE,
  payload: error
});

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

// Thunk Action Creators

// Fetch all academic issues
export const fetchAllIssues = () => async (dispatch) => {
  dispatch(fetchIssuesRequest());
  try {
    const data = await registrarService.getAllIssues();
    dispatch(fetchIssuesSuccess(data));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch issues';
    dispatch(fetchIssuesFailure(errorMessage));
    throw error;
  }
};

// Assign an issue to a specific lecturer or staff
export const assignIssue = (issueId, assignedTo) => async (dispatch) => {
  dispatch(assignIssueRequest());
  
  try {
    const data = await registrarService.assignIssue(issueId, assignedTo);
    dispatch(assignIssueSuccess(data));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to assign issue';
    dispatch(assignIssueFailure(errorMessage));
    throw error;
  }
};

// Fetch registrar dashboard data
export const fetchRegistrarData = () => async (dispatch) => {
  dispatch(fetchRegistrarDataRequest());
  
  try {
    const data = await registrarService.getDashboardData();
    dispatch(fetchRegistrarDataSuccess(data));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch registrar data';
    dispatch(fetchRegistrarDataFailure(errorMessage));
    throw error;
  }
};

// Filter issues based on criteria
export const filterIssues = (filters) => async (dispatch) => {
  dispatch(fetchIssuesRequest());
  
  try {
    const data = await registrarService.filterIssues(filters);
    dispatch(fetchIssuesSuccess(data));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to filter issues';
    dispatch(fetchIssuesFailure(errorMessage));
    throw error;
  }
};

// Generate a report
export const generateReport = (reportParams) => async () => {
  try {
    return await registrarService.generateReport(reportParams);
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
};