// src/redux/reducers/studentReducer.js
import {
    STUDENT_DATA_REQUEST,
    STUDENT_DATA_SUCCESS,
    STUDENT_DATA_FAILURE,
    FETCH_ISSUES_REQUEST,
    FETCH_ISSUES_SUCCESS,
    FETCH_ISSUES_FAILURE,
    FETCH_ANNOUNCEMENTS_REQUEST,
    FETCH_ANNOUNCEMENTS_SUCCESS,
    FETCH_ANNOUNCEMENTS_FAILURE
  } from '../actions/studentActions';
  
  const initialState = {
    profile: null,
    issues: [],
    announcements: [],
    courses: [],
    isLoading: false,
    error: null
  };
  
  export const studentReducer = (state = initialState, action) => {
    switch (action.type) {
      case STUDENT_DATA_REQUEST:
      case FETCH_ISSUES_REQUEST:
      case FETCH_ANNOUNCEMENTS_REQUEST:
        return {
          ...state,
          isLoading: true,
          error: null
        };
        
      case STUDENT_DATA_SUCCESS:
        return {
          ...state,
          isLoading: false,
          profile: action.payload.profile,
          courses: action.payload.courses || [],
          error: null
        };
        
      case FETCH_ISSUES_SUCCESS:
        return {
          ...state,
          isLoading: false,
          issues: action.payload,
          error: null
        };
        
      case FETCH_ANNOUNCEMENTS_SUCCESS:
        return {
          ...state,
          isLoading: false,
          announcements: action.payload,
          error: null
        };
        
      case STUDENT_DATA_FAILURE:
      case FETCH_ISSUES_FAILURE:
      case FETCH_ANNOUNCEMENTS_FAILURE:
        return {
          ...state,
          isLoading: false,
          error: action.payload
        };
        
      default:
        return state;
    }
  };