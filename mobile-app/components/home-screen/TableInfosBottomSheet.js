import React, { useRef, useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

import { useSelector, useDispatch } from "react-redux";
import {
	setCloseBottomSheet,
	selectCloseBottomSheet,
	selectOpenBottomSheet,
	setOpenBottomSheet,
	selectSelectedTable,
	setSelectedTable,
} from "../../store/slices/main";

export default function TableInfosBottomSheet() {
	const bottomSheetRef = useRef(null);

	const selectedTable = useSelector(selectSelectedTable);

	const openBottomSheet = useSelector(selectOpenBottomSheet);

	const snapPoints = useMemo(() => ["40%"], []);

	const closeBottomSheet = useSelector(selectCloseBottomSheet);
	const dispatch = useDispatch();

	useEffect(() => {
		if (closeBottomSheet) {
			bottomSheetRef.current.close();
			dispatch(setCloseBottomSheet(false));
		}
		if (openBottomSheet) {
			bottomSheetRef.current.expand();
			dispatch(setOpenBottomSheet(false));
		}
	}, [closeBottomSheet, openBottomSheet]);

	const onChange = (e) => {
		if (e == -1) {
			bottomSheetRef.current.close();
			dispatch(setSelectedTable(null));
		}
	};

	return (
		<BottomSheet
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			enablePanDownToClose={true}
			index={-1}
			onChange={onChange}
		>
			<View style={styles.contentContainer}>
				<Text style={styles.textFontFamily}>
					{selectedTable?.properties.place}
				</Text>
				{selectedTable?.properties.lit == 1 ? (
					<Text style={styles.textFontFamily}>Table éclairée</Text>
				) : (
					<Text style={styles.textFontFamily}>Table non éclairée</Text>
				)}
				{selectedTable?.properties.covered == 1 ? (
					<Text style={styles.textFontFamily}>Table couverte</Text>
				) : (
					<Text style={styles.textFontFamily}>Table non couverte</Text>
				)}
				{selectedTable?.properties.lastCheckDate ? (
					<Text style={styles.textFontFamily}>
						Table vérifiée le {selectedTable.properties.lastCheckDate}
					</Text>
				) : (
					<Text style={styles.textFontFamily}>Table jamais vérifiée</Text>
				)}
				{selectedTable?.properties.tableSurface ? (
					<Text style={styles.textFontFamily}>
						Table en {selectedTable.properties.tableSurface}
					</Text>
				) : (
					<Text style={styles.textFontFamily}>
						Pas d'information sur la surface de la table
					</Text>
				)}
			</View>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		alignItems: "center",
	},
	textFontFamily: {
		fontFamily: "Euclid Circular A Regular",
	},
});
