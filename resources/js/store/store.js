import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import languageReducer from './slices/languageSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        course: courseReducer,
        language: languageReducer,
    },
});

export default store;
