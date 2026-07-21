import { Fragment } from "react";
import { SectionHeading } from "@/components/section-heading";

type ContactChannel = {
	protocol: string;
	address: string;
	href: string;
};

type ContactSectionProps = {
	readonly num: number;
	readonly data: ContactChannel[];
};

export function ContactSection({ num, data }: ContactSectionProps) {
	return (
		<>
			<SectionHeading num={num} title="Contact" id="contact" />
			<dl className="facts">
				{data.map((channel) => (
					<Fragment key={channel.protocol}>
						<dt>{channel.protocol}</dt>
						<dd>
							{channel.href ? (
								<a
									href={channel.href}
									target={
										channel.protocol.toUpperCase() === "EMAIL"
											? undefined
											: "_blank"
									}
									rel={
										channel.protocol.toUpperCase() === "EMAIL"
											? undefined
											: "noopener noreferrer"
									}
								>
									{channel.address}
								</a>
							) : (
								<span>{channel.address}</span>
							)}
						</dd>
					</Fragment>
				))}
			</dl>
		</>
	);
}
