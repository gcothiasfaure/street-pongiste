import { View } from "react-native";
import React, { useEffect } from "react";
import axios from "axios";

import Map from "../components/home-screen/Map";
import TableInfosBottomSheet from "../components/home-screen/TableInfosBottomSheet";
import NavigateToUserLocationButton from "../components/home-screen/NavigateToUserLocationButton";

import { useDispatch, useSelector } from "react-redux";
import { selectUserLocation, setTables } from "../store/slices/main";

export default function Home() {
	const dispatch = useDispatch();
	const userLocation = useSelector(selectUserLocation);

	useEffect(() => {
		axios
			.get("https://api.street-pongiste.fr/tables/")
			.then((response) => {
				dispatch(setTables(response.data));
				console.log("tables has been set");
			})
			.catch((error) => console.error(error));
	}, []);

	return (
		<View style={{ flex: 1 }}>
			<Map />
			<TableInfosBottomSheet />
			{userLocation && <NavigateToUserLocationButton />}
		</View>
	);
}
