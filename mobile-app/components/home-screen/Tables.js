import { StyleSheet } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	setAppIsReady,
	selectTables,
	setFocusOnSelectedTable,
	setOpenBottomSheet,
	setSelectedTable,
} from "../../store/slices/main";
import MapboxGL from "@rnmapbox/maps";

export default function Tables() {
	const dispatch = useDispatch();

	const onLayout = () => {
		dispatch(setAppIsReady(true));
	};

	const onPress = (e) => {
		console.log("circle layer is pressed");
		const feature = e?.features[0];
		dispatch(setSelectedTable(feature));
		dispatch(setOpenBottomSheet(true));
		dispatch(setFocusOnSelectedTable(true));
	};

	const tables = useSelector(selectTables);

	return (
		<MapboxGL.ShapeSource
			id="mapPinsSource"
			shape={tables}
			onPress={onPress}
			width={20}
			height={20}
		>
			<MapboxGL.CircleLayer
				onLayout={onLayout}
				id="mapPinsLayer2"
				style={styles.circleLayer}
			/>
		</MapboxGL.ShapeSource>
	);
}

const styles = StyleSheet.create({
	circleLayer: {
		circleStrokeWidth: 3,
		circleStrokeColor: "black",
		circleColor: "white",
		visibility: "visible",
	},
});
