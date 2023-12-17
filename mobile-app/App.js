import React from "react";

import { store } from "./store/store";
import { Provider } from "react-redux";
import Root from "./root/Root";

import * as ScreenOrientation from "expo-screen-orientation";
import { useFonts } from "expo-font";

export default function App() {
	const [fontLoaded] = useFonts({
		"Euclid Circular A Regular": require("./assets/fonts/EuclidCircularARegular.ttf"),
	});

	(async () => {
		await ScreenOrientation.lockAsync(
			ScreenOrientation.OrientationLock.PORTRAIT_UP
		);
	})();

	if (!fontLoaded) {
		return null;
	}

	return (
		<Provider store={store}>
			<Root />
		</Provider>
	);
}
