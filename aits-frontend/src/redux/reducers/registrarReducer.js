import {
  FETCH_ISSUES_REQUEST,
  FETCH_ISSUES_SUCCESS,
  FETCH_ISSUES_FAILURE,
  ASSIGN_ISSUE_REQUEST,
  ASSIGN_ISSUE_SUCCESS,
  ASSIGN_ISSUE_FAILURE,
  REGISTRAR_DATA_REQUEST,
  REGISTRAR_DATA_SUCCESS,
  REGISTRAR_DATA_FAILURE
} from '../actions/registrarActions';

// Initial state for the registrar-related data
const initialState = {
  issues: {
    data: [],
    loading: false,
    error: null
  },
  stats: {
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0
  },
  registrarData: {
    profile: {},
    dashboard: {},
    loading: false,
    error: null
  },
  assignIssue: {
    loading: false,
    error: null,
    success: false
  }
};

// Reducer function to handle all registrar-related actions
export default function registrarReducer(state = initialState, action) {
  switch (action.type) {
    // Fetch Issues
    case FETCH_ISSUES_REQUEST:
      return {
        ...state,
        issues: {
          ...state.issues,
          loading: true,
          error: null
        }
      };
      case FETCH_ISSUES_SUCCESS:
        const issues = action.payload.issues || [];
        return {
          ...state,
          issues: {
            data: issues,
            loading: false,
            error: null
          },
          stats: {
            totalIssues: issues.length,
            pendingIssues: issues.filter(issue => issue.status !== 'resolved').length,
            resolvedIssues: issues.filter(issue => issue.status === 'resolved').length
          }
        };
    case FETCH_ISSUES_FAILURE:
      return {
        ...state,
        issues: {
          ...state.issues,
          loading: false,
          error: action.payload
        }
      };
      
    // Assign Issue
    case ASSIGN_ISSUE_REQUEST:
      return {
        ...state,
        assignIssue: {
          loading: true,
          error: null,
          success: false
        }
      };
    case ASSIGN_ISSUE_SUCCESS:
      return {
        ...state,
        assignIssue: {
          loading: false,
          error: null,
          success: true
        }
      };
    case ASSIGN_ISSUE_FAILURE:
      return {
        ...state,
        assignIssue: {
          loading: false,
          error: action.payload,
          success: false
        }
      };
      
    // Registrar Data
    case REGISTRAR_DATA_REQUEST:
      return {
        ...state,
        registrarData: {
          ...state.registrarData,
          loading: true,
          error: null
        }
      };
    case REGISTRAR_DATA_SUCCESS:
      return {
        ...state,
        registrarData: {
          profile: action.payload.profile || {},
          dashboard: action.payload.dashboard || {},
          loading: false,
          error: null
        }
      };
    case REGISTRAR_DATA_FAILURE:
      return {
        ...state,
        registrarData: {
          ...state.registrarData,
          loading: false,
          error: action.payload
        }
      };
      
    default:
      return state;
  }
}