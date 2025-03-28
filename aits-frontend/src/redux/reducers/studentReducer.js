// src/redux/reducers/studentReducer.js
import { 
  STUDENT_DATA_REQUEST, 
  STUDENT_DATA_SUCCESS, 
  STUDENT_DATA_FAILURE 
} from '../actions/studentActions';

const initialState = {
  profileData: null,
  loading: false,
  error: null
};

const studentReducer = (state = initialState, action) => {
  switch (action.type) {
    case STUDENT_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case STUDENT_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        profileData: action.payload,
        error: null
      };
    case STUDENT_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default studentReducer;