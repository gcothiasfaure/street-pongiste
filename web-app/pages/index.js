import * as React from "react";
import Head from "next/head";
import Map, { Source, Layer, GeolocateControl } from "react-map-gl";
import { useCallback, useRef, useState } from "react";

import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

const pointLayer = {
	id: "tables",
	type: "circle",
	paint: {
		"circle-color": "#FFFFFF",
		"circle-stroke-width": 3,
	},
};

const pointLayerSelected = {
	id: "tables-selected",
	type: "circle",
	paint: {
		"circle-color": "#E23B3B",
		"circle-radius": 7,
		"circle-stroke-width": 3,
	},
};

export async function getServerSideProps() {
	const res = await fetch("https://api.street-pongiste.lgna.fr/tables/");
	const data = await res.json();
	return { props: { data } };
}

export default function Home({ data }) {
	const mapRef = useRef();

	const [cursor, setCursor] = useState("auto");
	const [selectedTable, setSelectedTable] = useState({});
	const [viewState, setViewState] = useState({
		longitude: 2.4,
		latitude: 46.56,
		zoom: 5,
	});

	const onClick = useCallback(
		(event) => {
			setSelectedTable(event.features[0]);

			if (event.features[0]) {
				if (viewState.zoom > 15) {
					mapRef.current?.flyTo({
						center: event.features[0].geometry.coordinates,
						duration: 2000,
					});
				} else {
					mapRef.current?.flyTo({
						center: event.features[0].geometry.coordinates,
						duration: 2000,
						zoom: 15,
					});
				}
			}
		},
		[viewState]
	);

	const onMouseEnter = useCallback(() => setCursor("pointer"), []);
	const onMouseLeave = useCallback(() => setCursor("auto"), []);

	const onMouseDown = useCallback(() => setCursor("grab"), []);
	const onMouseUp = useCallback(() => setCursor("auto"), []);

	return (
		<>
			<Head>
				<title>Street pongiste</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/icon.png" />
			</Head>
			<div className="absolute inset-0">
				<Map
					ref={mapRef}
					dragRotate={false}
					touchPitch={false}
					onClick={onClick}
					cursor={cursor}
					{...viewState}
					onMove={(evt) => setViewState(evt.viewState)}
					style={{ width: "100%", height: "100%" }}
					mapStyle="mapbox://styles/gcothiasfaure/clcnexco8004v14lcjfnjvh6q"
					mapboxAccessToken={MAPBOX_TOKEN}
					interactiveLayerIds={["tables"]}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onDragStart={onMouseDown}
					onDragEnd={onMouseUp}
				>
					<GeolocateControl
						positionOptions={{
							enableHighAccuracy: true,
							timeout: Infinity,
							maximumAge: Infinity,
						}}
						style={{
							color: "black",
						}}
						trackUserLocation={true}
						showAccuracyCircle={false}
						showUserHeading={true}
					/>
					<Source id="my-data" type="geojson" data={data}>
						<Layer {...pointLayer} />
					</Source>
					{selectedTable?.geometry && (
						<Source id="my-data-selected" type="geojson" data={selectedTable}>
							<Layer {...pointLayerSelected} />
						</Source>
					)}
				</Map>

				{selectedTable?.geometry && (
					<div className="absolute bottom-0 bg-white sm:w-2/3 md:w-1/2 lg:w-2/5 left-2/4 -translate-x-1/2 p-3 mb-3 z-50 w-11/12 rounded-lg">
						<div className="absolute top-0 right-0 p-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								className="hover:cursor-pointer w-6 h-6"
								onClick={() => setSelectedTable({})}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p>{selectedTable?.properties.place}</p>
							{selectedTable?.properties.lit == 1 ? (
								<p>Table éclairée</p>
							) : (
								<p>Table non éclairée</p>
							)}
							{selectedTable?.properties.covered == 1 ? (
								<p>Table couverte</p>
							) : (
								<p>Table non couverte</p>
							)}
							{selectedTable?.properties.lastCheckDate ? (
								<p>
									Table vérifiée le {selectedTable.properties.lastCheckDate}
								</p>
							) : (
								<p>Table jamais vérifiée</p>
							)}
							{selectedTable?.properties.tableSurface ? (
								<p>Table en {selectedTable.properties.tableSurface}</p>
							) : (
								<p>Pas d&apos;information sur la surface de la table</p>
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
}
