import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";

type Membership = {
	name: string;
	fullName: string;
	logo: string;
};

type ProfessionalMembershipsSectionProps = {
	readonly num: number;
	readonly data: Membership[];
};

export function ProfessionalMembershipsSection({
	num,
	data,
}: ProfessionalMembershipsSectionProps) {
	return (
		<>
			<SectionHeading
				num={num}
				title="Professional Memberships"
				id="memberships"
			/>
			<ul className="memberships">
				{data.map((membership) => (
					<li key={membership.name}>
						<span className="m-logo">
							<Image
								src={membership.logo}
								alt={`${membership.name} logo`}
								fill
								style={{ objectFit: "contain" }}
							/>
						</span>
						<span>
							<b>{membership.name}</b> — {membership.fullName}
						</span>
					</li>
				))}
			</ul>
		</>
	);
}
