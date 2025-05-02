// src/redux/store.js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk'; // Updated: changed from default import to named import
import { composeWithDevTools } from '@redux-devtools/extension'; // Updated: changed package name
import authReducer from './reducers/authReducer';
import  studentReducer  from './reducers/studentReducer';
import  registrarReducer  from './reducers/registrarReducer';
import lecturerReducer from './reducers/LecturerReducer';
import { issuesReducer } from './reducers/issuesReducer';
import  LecturerReducer from './reducers/LecturerReducer';


// Combine all reducers (add more as needed)
const rootReducer = combineReducers({
  auth: authReducer,
  student: studentReducer,
  registrar: registrarReducer,
  issues: issuesReducer,
  lecturer: LecturerReducer,
  // Add other reducers here
});

// Create store with middleware
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);


export default store;