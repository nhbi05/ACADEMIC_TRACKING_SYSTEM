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

// Basic Action Creators (unchanged)
export const fetchIssuesRequest = () => ({ type: FETCH_ISSUES_REQUEST });
export const fetchIssuesFailure = (error) => ({ type: FETCH_ISSUES_FAILURE, payload: error });
export const assignIssueRequest = () => ({ type: ASSIGN_ISSUE_REQUEST });
export const assignIssueFailure = (error) => ({ type: ASSIGN_ISSUE_FAILURE, payload: error });
export const fetchRegistrarDataRequest = () => ({ type: REGISTRAR_DATA_REQUEST });
export const fetchRegistrarDataFailure = (error) => ({ type: REGISTRAR_DATA_FAILURE, payload: error });

// Modified Action Creators
export const fetchIssuesSuccess = (data) => ({
  type: FETCH_ISSUES_SUCCESS,
  payload: {
    issues: data.issues || [],
    stats: data.stats || {
      totalIssues: data.issues?.length || 0,
      pendingIssues: data.issues?.filter(i => i.status?.toLowerCase() !== 'resolved').length || 0,
      resolvedIssues: data.issues?.filter(i => i.status?.toLowerCase() === 'resolved').length || 0
    }
  }
});

export const assignIssueSuccess = (issue) => ({
  type: ASSIGN_ISSUE_SUCCESS,
  payload: {
    id: issue.id,
    status: issue.status,
    assigned_to: issue.assigned_to,
    // Include any other fields that might need updating
    ...issue
  }
});

export const fetchRegistrarDataSuccess = (data) => ({
  type: REGISTRAR_DATA_SUCCESS,
  payload: {
    profile: data.profile || {},
    dashboard: data.dashboard || {}
  }
});

// Thunk Action Creators with Enhanced Error Handling

// Fetch all academic issues with stats
// In registrarActions.js
export const fetchAllIssues = () => async (dispatch) => {
  dispatch(fetchIssuesRequest());
  try {
    const response = await registrarService.getAllIssues();
    
    // Transform data to ensure consistent structure
    const transformedIssues = response.issues.map(issue => ({
      id: issue.id,
      student_name: issue.student_name || issue.student?.name,
      course: issue.course || issue.student?.course,
      registration_no: issue.registration_no || issue.student?.registration_number,
      assigned_to: issue.assigned_to,
      status: issue.status || 'pending'
    }));
    
    dispatch(fetchIssuesSuccess({
      issues: transformedIssues,
      stats: response.stats
    }));
    
    return transformedIssues;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch issues';
    dispatch(fetchIssuesFailure(errorMessage));
    throw error;
  }
};
// Assign an issue with complete state update
export const assignIssue = (issueId, assignedTo) => async (dispatch) => {
  dispatch(assignIssueRequest());
  try {
    const response = await registrarService.assignIssue(issueId, assignedTo);
    
    // Ensure the response contains the full updated issue
    const updatedIssue = {
      ...response.issue || response.data || response,
      id: issueId,
      assigned_to: assignedTo,
      status: response.status || 'assigned' // Default status if not provided
    };
    
    dispatch(assignIssueSuccess(updatedIssue));
    return updatedIssue;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to assign issue';
    dispatch(assignIssueFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

// Fetch registrar data with profile and dashboard info
export const fetchRegistrarData = () => async (dispatch) => {
  dispatch(fetchRegistrarDataRequest());
  try {
    const response = await registrarService.getDashboardData();
    
    const payload = {
      profile: response.profile || response.data?.profile || {},
      dashboard: response.dashboard || response.data?.dashboard || {}
    };
    
    dispatch(fetchRegistrarDataSuccess(payload));
    return payload;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch registrar data';
    dispatch(fetchRegistrarDataFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

// Filter issues with stats calculation
export const filterIssues = (filters) => async (dispatch) => {
  dispatch(fetchIssuesRequest());
  try {
    const response = await registrarService.filterIssues(filters);
    
    const payload = {
      issues: response.issues || response.data?.issues || response,
      stats: response.stats || {
        totalIssues: (response.issues || response.data?.issues || response).length,
        pendingIssues: (response.issues || response.data?.issues || response)
          .filter(i => i.status?.toLowerCase() !== 'resolved').length,
        resolvedIssues: (response.issues || response.data?.issues || response)
          .filter(i => i.status?.toLowerCase() === 'resolved').length
      }
    };
    
    dispatch(fetchIssuesSuccess(payload));
    return payload;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to filter issues';
    dispatch(fetchIssuesFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

// Generate report (unchanged as it doesn't affect state)
export const generateReport = (reportParams) => async () => {
  try {
    return await registrarService.generateReport(reportParams);
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
};