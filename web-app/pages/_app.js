import "@/styles/globals.css";

import localFont from "@next/font/local";

// Font files can be colocated inside of `pages`
const EuclidCircularARegular = localFont({
	src: "../styles/fonts/EuclidCircularARegular.ttf",
	variable: "--font-EuclidCircularARegular",
});

export default function App({ Component, pageProps }) {
	return (
		<main className={`${EuclidCircularARegular.variable} font-sans`}>
			<Component {...pageProps} />
		</main>
	);
}
