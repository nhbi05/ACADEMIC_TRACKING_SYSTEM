const initialState = {
  loading: false,
  issues: [],
  resolvedIssues: [],
  selectedIssue: null,
  notifications: [],
  error: null
};

const lecturerReducer = (state = initialState, action) => {
  switch (action.type) {
    // Assigned Issues
    case 'FETCH_ASSIGNED_ISSUES_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_ASSIGNED_ISSUES_SUCCESS':
      return {
        ...state,
        loading: false,
        issues: action.payload,
        error: null
      };
    case 'FETCH_ASSIGNED_ISSUES_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Resolved Issues
    case 'FETCH_RESOLVED_ISSUES_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_RESOLVED_ISSUES_SUCCESS':
      return {
        ...state,
        loading: false,
        resolvedIssues: action.payload,
        error: null
      };
    case 'FETCH_RESOLVED_ISSUES_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Resolve Issue
    case 'RESOLVE_ISSUE_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'RESOLVE_ISSUE_SUCCESS':
      // Move the resolved issue from 'issues' to 'resolvedIssues'
      const resolvedIssueId = action.payload;
      const resolvedIssue = state.issues.find(issue => issue.id === resolvedIssueId);
      
      return {
        ...state,
        loading: false,
        issues: state.issues.filter(issue => issue.id !== resolvedIssueId),
        resolvedIssues: resolvedIssue 
          ? [...state.resolvedIssues, {...resolvedIssue, status: 'resolved'}] 
          : state.resolvedIssues,
        error: null
      };
    case 'RESOLVE_ISSUE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Issue Details
    case 'FETCH_ISSUE_DETAILS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_ISSUE_DETAILS_SUCCESS':
      return {
        ...state,
        loading: false,
        selectedIssue: action.payload,
        error: null
      };
    case 'FETCH_ISSUE_DETAILS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Notifications
    case 'FETCH_NOTIFICATIONS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_NOTIFICATIONS_SUCCESS':
      return {
        ...state,
        loading: false,
        notifications: action.payload,
        error: null
      };
    case 'FETCH_NOTIFICATIONS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'MARK_NOTIFICATION_AS_READ_SUCCESS':
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification.id === action.payload 
            ? { ...notification, read: true } 
            : notification
        )
      };
      
    default:
      return state;
  }
};

export default lecturerReducer;