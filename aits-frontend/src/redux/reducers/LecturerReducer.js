const initialState = {
    issues: [], // List of issues assigned to the lecturer
    issueDetails: null, // Details of a specific issue
    notifications: [], // List of notifications for the lecturer
    error: null, // Error messages
    loading: false, // Loading state for API calls
  };
  
  const LecturerReducer = (state = initialState, action) => {
    switch (action.type) {
      // Resolve Issue
      case 'RESOLVE_ISSUE_SUCCESS':
        return {
          ...state,
          issues: state.issues.filter((issue) => issue.id !== action.payload),
        };
      case 'RESOLVE_ISSUE_FAILURE':
        return {
          ...state,
          error: action.payload,
        };
  
      // Fetch Assigned Issues
      case 'FETCH_ASSIGNED_ISSUES_REQUEST':
        return {
          ...state,
          loading: false,
          error: null,
        };
      case 'FETCH_ASSIGNED_ISSUES_SUCCESS':
        return {
          ...state,
          issues: action.payload,
          loading: false,
        };
      case 'FETCH_ASSIGNED_ISSUES_FAILURE':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Fetch Issue Details
      case 'FETCH_ISSUE_DETAILS_REQUEST':
        return {
          ...state,
          loading: true,
          error: null,
        };
      case 'FETCH_ISSUE_DETAILS_SUCCESS':
        return {
          ...state,
          issueDetails: action.payload,
          loading: false,
          error: null,
        };
      case 'FETCH_ISSUE_DETAILS_FAILURE':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Fetch Notifications
      case 'FETCH_NOTIFICATIONS_REQUEST':
        return {
          ...state,
          loading: true,
          error: null,
        };
      case 'FETCH_NOTIFICATIONS_SUCCESS':
        return {
          ...state,
          notifications: action.payload,
          loading: false,
          error: null,
        };
      case 'FETCH_NOTIFICATIONS_FAILURE':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Mark Notification as Read
      case 'MARK_NOTIFICATION_AS_READ_SUCCESS':
        return {
          ...state,
          notifications: state.notifications.filter(
            (notification) => notification.id !== action.payload
          ),
        };
      case 'MARK_NOTIFICATION_AS_READ_FAILURE':
        return {
          ...state,
          error: action.payload,
        };
  
      default:
        return state;
    }
  };
  
  export default LecturerReducer;