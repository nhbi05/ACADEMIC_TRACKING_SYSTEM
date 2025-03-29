// src/redux/reducers/registrarReducer.js
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
  
  const initialState = {
    issues: [],
    registrarData: null,
    loading: false,
    error: null
  };
  
  export const registrarReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_ISSUES_REQUEST:
      case ASSIGN_ISSUE_REQUEST:
      case REGISTRAR_DATA_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case FETCH_ISSUES_SUCCESS:
        return {
          ...state,
          issues: action.payload,
          loading: false,
          error: null
        };
      
      case ASSIGN_ISSUE_SUCCESS:
        return {
          ...state,
          issues: state.issues.map(issue => 
            issue.id === action.payload.id ? action.payload : issue
          ),
          loading: false,
          error: null
        };
      
      case REGISTRAR_DATA_SUCCESS:
        return {
          ...state,
          registrarData: action.payload,
          loading: false,
          error: null
        };
      
      case FETCH_ISSUES_FAILURE:
      case ASSIGN_ISSUE_FAILURE:
      case REGISTRAR_DATA_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      
      default:
        return state;
    }
  };