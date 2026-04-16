import { configureStore } from '@reduxjs/toolkit';
import designerSessionReducer from './designerSessionSlice';

export const store = configureStore({
  reducer: {
    designerSession: designerSessionReducer,
  },
});

export default store;
