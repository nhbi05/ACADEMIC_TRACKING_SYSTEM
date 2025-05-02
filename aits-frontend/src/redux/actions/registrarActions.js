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

export const FETCH_LECTURERS_REQUEST = 'FETCH_LECTURERS_REQUEST';
export const FETCH_LECTURERS_SUCCESS = 'FETCH_LECTURERS_SUCCESS';
export const FETCH_LECTURERS_FAILURE = 'FETCH_LECTURERS_FAILURE';

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

// Action Creators for fetchLecturers
export const fetchLecturersRequest = () => ({
  type: FETCH_LECTURERS_REQUEST
});

export const fetchLecturersSuccess = (data) => ({
  type: FETCH_LECTURERS_SUCCESS,
  payload: data
});

export const fetchLecturersFailure = (error) => ({
  type: FETCH_LECTURERS_FAILURE,
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
// Assign an issue to a specific lecturer or staff
// assignIssue.js
// In registrarActions.js, update the assignIssue function
export const assignIssue = (issueId, assignedTo) => async (dispatch) => {
  dispatch(assignIssueRequest());
  
  try {
    // Ensure issueId and assignedTo are integers
    const parsedIssueId = parseInt(issueId, 10);
    const parsedAssignedTo = parseInt(assignedTo, 10);
    
    const data = await registrarService.assignIssue(parsedIssueId, parsedAssignedTo);
    dispatch(assignIssueSuccess(data));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to assign issue';
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


export const fetchLecturers = () => async (dispatch) => {
  dispatch({ type: FETCH_LECTURERS_REQUEST });
  
  try {
    const response = await registrarService.getLecturers();
    dispatch({
      type: FETCH_LECTURERS_SUCCESS,
      payload: response
    });
    return response;
  } catch (error) {
    dispatch({
      type: FETCH_LECTURERS_FAILURE,
      payload: error.message
    });
    throw error;
  }
};