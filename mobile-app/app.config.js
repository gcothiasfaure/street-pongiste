module.exports = {
	expo: {
		name: "Street pongiste",
		slug: "streetpongistemobileapp",
		version: "1.0.4",
		orientation: "portrait",
		icon: "./assets/icon.png",
		userInterfaceStyle: "light",
		splash: {
			image: "./assets/splash.png",
			resizeMode: "contain",
			backgroundColor: "#000000",
		},
		updates: {
			fallbackToCacheTimeout: 0,
		},
		assetBundlePatterns: ["**/*"],
		ios: {
			supportsTablet: false,
			bundleIdentifier: "com.lgna.streetpongiste-mobileapp",
			infoPlist: {
				PrimaryLanguage: "fr",
				CFBundleDevelopmentRegion: "fr",
				NSLocationWhenInUseUsageDescription:
					"This application only uses the user's location to display it on the map. Thanks to this, the user can, for example, locate himself on the map and locate himself in relation to the ping pong tables around him.",
			},
			buildNumber: "5",
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/adaptive-icon.png",
				backgroundColor: "#FFFFFF",
			},
		},
		plugins: [
			[
				"@rnmapbox/maps",
				{
					RNMapboxMapsImpl: "mapbox",
					RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_SECRET_KEY,
				},
			],
		],
		extra: {
			eas: {
				projectId: "dab8470f-a677-4215-8820-19980fe81c7f",
			},
		},
	},
};
