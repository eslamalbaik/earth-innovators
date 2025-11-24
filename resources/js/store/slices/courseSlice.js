import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    courses: [],
    selectedCourse: null,
    categories: [],
    loading: false,
    error: null,
};

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setCourses: (state, action) => {
            state.courses = action.payload;
        },
        setSelectedCourse: (state, action) => {
            state.selectedCourse = action.payload;
        },
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setCourses, setSelectedCourse, setCategories, setLoading, setError } = courseSlice.actions;
export default courseSlice.reducer;
