import Link from "next/link";
import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";

export const metadata = {
	title: "surprise @kc3wny.com",
	robots: { index: false, follow: false },
};

export default function SurprisePage() {
	return (
		<DocumentWrapper>
			<hr />

			<h1 className="mh-call" style={{ fontSize: "30px", margin: "6px 0 2px" }}>
				Surprise!
			</h1>
			<p className="byline">
				You have now been surprised, dazzled, and perhaps delighted. If you were
				not, please leave a review{" "}
				<Link href="https://www.youtube.com/watch?v=XfELJU1mRMg">here.</Link>
			</p>

			<hr />

			<figure className="snap wide">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="/logo/home.gif"
					alt="Animated GOES satellite loop of Earth's day/night cycle"
				/>
			</figure>

			<DocumentFooter backLinks={[{ href: "/", title: "Home" }]} />
		</DocumentWrapper>
	);
}
