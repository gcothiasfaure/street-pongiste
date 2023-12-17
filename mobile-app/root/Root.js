import React, { useEffect } from "react";
import * as Location from "expo-location";
import Home from "../screens/Home";

import * as SplashScreen from "expo-splash-screen";

import { useSelector, useDispatch } from "react-redux";
import {
	setUserLocation,
	selectAppIsReady,
	setUserLocationHasBeenAsk,
	selectUserLocationHasBeenAsk,
} from "../store/slices/main";

SplashScreen.preventAutoHideAsync();

export default function Root() {
	const dispatch = useDispatch();

	const appIsReady = useSelector(selectAppIsReady);
	const userLocationHasBeenAsk = useSelector(selectUserLocationHasBeenAsk);

	useEffect(() => {
		(async () => {
			await SplashScreen.preventAutoHideAsync();

			let { status } = await Location.requestForegroundPermissionsAsync();
			dispatch(setUserLocationHasBeenAsk(true));
			console.log(status);

			let coords = null;

			if (status == "granted") {
				console.log("pass");
				const locationResponse = await Location.getCurrentPositionAsync({
					accuracy: 1,
				});
				coords = [
					locationResponse.coords.longitude,
					locationResponse.coords.latitude,
				];
			}

			dispatch(setUserLocation(coords));
			console.log("user location has been set to " + coords);
		})();
	}, []);

	if (appIsReady && userLocationHasBeenAsk) {
		console.log("hide splash screen");
		setTimeout(() => {
			SplashScreen.hideAsync();
		}, 1000);
	}

	return <Home />;
}
