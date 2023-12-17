import React, { forwardRef } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

import { useDispatch } from "react-redux";
import {
	setNavigateToUserLocation,
	setCloseBottomSheet,
} from "../../store/slices/main";

export default function NavigateToUserLocationButton() {
	const dispatch = useDispatch();

	const handleNavigatePress = () => {
		console.log("navigate to user location");
		console.log("close bottom-sheet");
		dispatch(setNavigateToUserLocation(true));
		dispatch(setCloseBottomSheet(true));
	};

	return (
		<TouchableOpacity style={styles.navigateView} onPress={handleNavigatePress}>
			<View>
				<Ionicons name="ios-navigate" size={30} color="black" />
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	navigateView: {
		backgroundColor: "grey",
		width: 40,
		height: 40,
		position: "absolute",
		zIndex: 1000,
		borderRadius: 100,
		right: 0,
		top: Constants.statusBarHeight,
		margin: 10,
		alignItems: "center",
		justifyContent: "center",
	},
});
