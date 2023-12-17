import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	appIsReady: false,
	fontsAreLoaded: false,
	tables: null,
	userLocation: null,
	userLocationHasBeenAsk: false,
	navigateToUserLocation: false,
	closeBottomSheet: false,
	selectedTable: null,
	openBottomSheet: false,
	focusOnSelectedTable: false,
};

const mainSlice = createSlice({
	name: "main",
	initialState,
	reducers: {
		setAppIsReady: (state, action) => {
			state.appIsReady = action.payload;
		},
		setUserLocationHasBeenAsk: (state, action) => {
			state.userLocationHasBeenAsk = action.payload;
		},
		setFontsAreLoaded: (state, action) => {
			state.fontsAreLoaded = action.payload;
		},
		setUserLocation: (state, action) => {
			state.userLocation = action.payload;
		},
		setTables: (state, action) => {
			state.tables = action.payload;
		},
		setNavigateToUserLocation: (state, action) => {
			state.navigateToUserLocation = action.payload;
		},
		setCloseBottomSheet: (state, action) => {
			state.closeBottomSheet = action.payload;
		},
		setSelectedTable: (state, action) => {
			state.selectedTable = action.payload;
		},
		setOpenBottomSheet: (state, action) => {
			state.openBottomSheet = action.payload;
		},
		setFocusOnSelectedTable: (state, action) => {
			state.focusOnSelectedTable = action.payload;
		},
	},
});

export const {
	setAppIsReady,
	setTables,
	setUserLocation,
	setFontsAreLoaded,
	setUserLocationHasBeenAsk,
	setNavigateToUserLocation,
	setCloseBottomSheet,
	setSelectedTable,
	setOpenBottomSheet,
	setFocusOnSelectedTable,
} = mainSlice.actions;

export const selectAppIsReady = (state) => state.main.appIsReady;
export const selectTables = (state) => state.main.tables;
export const selectUserLocation = (state) => state.main.userLocation;
export const selectFontsAreLoaded = (state) => state.main.fontsAreLoaded;
export const selectUserLocationHasBeenAsk = (state) =>
	state.main.userLocationHasBeenAsk;
export const selectNavigateToUserLocation = (state) =>
	state.main.navigateToUserLocation;
export const selectCloseBottomSheet = (state) => state.main.closeBottomSheet;
export const selectSelectedTable = (state) => state.main.selectedTable;
export const selectOpenBottomSheet = (state) => state.main.openBottomSheet;
export const selectFocusOnSelectedTable = (state) =>
	state.main.focusOnSelectedTable;

export default mainSlice.reducer;
