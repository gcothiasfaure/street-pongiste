import { StyleSheet, View } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import MapboxGL from "@rnmapbox/maps";

import { useSelector, useDispatch } from "react-redux";
import {
	selectFocusOnSelectedTable,
	selectNavigateToUserLocation,
	selectSelectedTable,
	selectTables,
	selectUserLocation,
	setFocusOnSelectedTable,
	setNavigateToUserLocation,
	setCloseBottomSheet,
	setSelectedTable,
} from "../../store/slices/main";

import SelectedTable from "./SelectedTable";
import Tables from "./Tables";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_API_KEY);

export default function Map() {
	const camera = useRef(null);
	const mapView = useRef(null);

	const dispatch = useDispatch();

	const tables = useSelector(selectTables);
	const userLocation = useSelector(selectUserLocation);
	const selectedTable = useSelector(selectSelectedTable);
	const navigateToUserLocation = useSelector(selectNavigateToUserLocation);
	const focusOnSelectedTable = useSelector(selectFocusOnSelectedTable);

	const [zoomLevel, setZoomLevel] = useState(null);
	const [defaultCamera] = useState({
		centerCoordinate: [2.4, 46.56],
		zoomLevel: 5,
	});

	const onPressMapView = () => {
		console.log("map is pressed");
		dispatch(setSelectedTable(null));
		dispatch(setCloseBottomSheet(true));
	};

	const onRegionIsChanging = (e) => {
		setZoomLevel(e.properties.zoomLevel);
	};

	useEffect(() => {
		if (navigateToUserLocation) {
			camera.current.setCamera({
				centerCoordinate: userLocation,
				zoomLevel: 15,
				animationDuration: 500,
			});
			dispatch(setNavigateToUserLocation(false));
		}
		if (focusOnSelectedTable) {
			if (zoomLevel < 15) {
				camera.current.setCamera({
					centerCoordinate: selectedTable.geometry.coordinates,
					zoomLevel: 15,
					animationDuration: 500,
				});
			} else {
				camera.current.setCamera({
					centerCoordinate: selectedTable.geometry.coordinates,
					animationDuration: 500,
				});
			}
			dispatch(setFocusOnSelectedTable(false));
		}
	}, [navigateToUserLocation, focusOnSelectedTable]);

	return (
		<View style={{ flex: 1 }}>
			<BlurView intensity={20} style={styles.blurStatusBar} />
			<View style={{ flex: 1 }}>
				<MapboxGL.MapView
					ref={mapView}
					styleURL="mapbox://styles/gcothiasfaure/clcnexco8004v14lcjfnjvh6q"
					style={{ flex: 1 }}
					scaleBarEnabled={false}
					logoEnabled={false}
					rotateEnabled={false}
					pitchEnabled={false}
					onPress={onPressMapView}
					onRegionIsChanging={onRegionIsChanging}
				>
					<MapboxGL.UserLocation
						showsUserHeadingIndicator={true}
						animated={false}
						renderMode="native"
					/>

					<MapboxGL.Camera
						ref={camera}
						minZoomLevel={5}
						maxZoomLevel={20}
						defaultSettings={defaultCamera}
					/>

					{tables?.features.length > 0 ? (
						<>
							<Tables />
							{selectedTable && <SelectedTable />}
						</>
					) : null}
				</MapboxGL.MapView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	blurStatusBar: {
		height: Constants.statusBarHeight,
		position: "absolute",
		left: 0,
		right: 0,
		zIndex: 1000,
	},
});
