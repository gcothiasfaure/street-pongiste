import { StyleSheet } from "react-native";
import React from "react";
import MapboxGL from "@rnmapbox/maps";
import { useSelector } from "react-redux";
import { selectSelectedTable } from "../../store/slices/main";

export default function SelectedTable() {
	const selectedFeature = useSelector(selectSelectedTable);

	return (
		<MapboxGL.ShapeSource id="mapPinsSource2" shape={selectedFeature}>
			<MapboxGL.CircleLayer
				id="mapPinsLayer21"
				style={styles.circleLayerSelected}
			/>
		</MapboxGL.ShapeSource>
	);
}

const styles = StyleSheet.create({
	circleLayerSelected: {
		circleStrokeWidth: 3,
		circleStrokeColor: "black",
		circleColor: "red",
		circleRadius: 9,
	},
});
