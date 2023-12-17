import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./slices/main";

export const store = configureStore({
	reducer: {
		main: mainReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});
