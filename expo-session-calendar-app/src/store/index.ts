import { createStore } from 'redux';
import { combineReducers } from 'redux';
import sessionReducer from './sessionReducer';
import calendarReducer from './calendarReducer';

const rootReducer = combineReducers({
  session: sessionReducer,
  calendar: calendarReducer,
});

const store = createStore(rootReducer);

export default store;