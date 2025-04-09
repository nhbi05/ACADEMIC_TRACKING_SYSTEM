// src/redux/reducers/issuesReducer.js
import {
  FETCH_ISSUES_REQUEST,
  FETCH_ISSUES_SUCCESS,
  FETCH_ISSUES_FAILURE,
  CREATE_ISSUE_REQUEST,
  CREATE_ISSUE_SUCCESS,
  CREATE_ISSUE_FAILURE
} from '../actions/studentActions';

const initialState = {
  issues: [],
  loading: false,
  error: null,
  submitting: false
};

export const issuesReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetching cases
    case FETCH_ISSUES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ISSUES_SUCCESS:
      return { ...state, loading: false, issues: action.payload };
    case FETCH_ISSUES_FAILURE:
      return { ...state, loading: false, error: action.payload };
      
    // Creation cases
    case CREATE_ISSUE_REQUEST:
      return { ...state, submitting: true, error: null };
    case CREATE_ISSUE_SUCCESS:
      return { 
        ...state, 
        submitting: false,
        issues: [action.payload, ...state.issues], // Add new issue to the top
        error: null
      };
    case CREATE_ISSUE_FAILURE:
      return { ...state, submitting: false, error: action.payload };
      
    default:
      return state;
  }
};

export default issuesReducer;