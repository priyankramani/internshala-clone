import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: "en", // default
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      // save to localStorage
      localStorage.setItem("lang", action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export const selectLanguage = (state) => state.language.language;

export default languageSlice.reducer;