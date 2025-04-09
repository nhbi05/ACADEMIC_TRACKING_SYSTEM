import { lecturerService } from '../../services/api';

// Action to fetch resolved issues
export const fetchResolvedIssues = () => async (dispatch) => {
  dispatch({ type: 'FETCH_ISSUES_REQUEST' });

  try {
    const resolvedIssues = await lecturerService.getResolvedIssues();
    dispatch({ type: 'FETCH_ISSUES_SUCCESS', payload: resolvedIssues });
  } catch (error) {
    dispatch({ type: 'FETCH_ISSUES_FAILURE', payload: error.message });
  }
};

// Action to resolve an issue
export const resolveIssue = (issueId) => async (dispatch) => {
  try {
    await lecturerService.resolveIssue(issueId);
    dispatch({ type: 'RESOLVE_ISSUE_SUCCESS', payload: issueId });
  } catch (error) {
    dispatch({ type: 'RESOLVE_ISSUE_FAILURE', payload: error.message });
  }
};

// Action to fetch all assigned issues for the lecturer
export const fetchAssignedIssues = () => async (dispatch) => {
  try {
    const issues = await lecturerService.getAssignedIssues();
    dispatch({ type: 'FETCH_ASSIGNED_ISSUES_SUCCESS', payload: issues });
  } catch (error) {
    dispatch({ type: 'FETCH_ASSIGNED_ISSUES_FAILURE', payload: error.message });
  }
};

// Action to fetch issue details
export const fetchIssueDetails = (issueId) => async (dispatch) => {
  try {
    const issueDetails = await lecturerService.getIssueDetails(issueId);
    dispatch({ type: 'FETCH_ISSUE_DETAILS_SUCCESS', payload: issueDetails });
  } catch (error) {
    dispatch({ type: 'FETCH_ISSUE_DETAILS_FAILURE', payload: error.message });
  }
};

// Action to fetch notifications for the lecturer
export const fetchNotifications = () => async (dispatch) => {
  try {
    const notifications = await lecturerService.getNotifications();
    dispatch({ type: 'FETCH_NOTIFICATIONS_SUCCESS', payload: notifications });
  } catch (error) {
    dispatch({ type: 'FETCH_NOTIFICATIONS_FAILURE', payload: error.message });
  }
};

// Action to mark a notification as read
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
  try {
    await lecturerService.markNotificationAsRead(notificationId);
    dispatch({ type: 'MARK_NOTIFICATION_AS_READ_SUCCESS', payload: notificationId });
  } catch (error) {
    dispatch({ type: 'MARK_NOTIFICATION_AS_READ_FAILURE', payload: error.message });
  }
};
