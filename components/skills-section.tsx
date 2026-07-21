import { SectionHeading } from "@/components/section-heading";

type Skill = {
	category: string;
	items: string[];
};

type SkillsSectionProps = {
	readonly num: number;
	readonly data: Skill[];
};

export function SkillsSection({ num, data }: SkillsSectionProps) {
	return (
		<>
			<SectionHeading num={num} title="Skills" id="skills" />
			<table className="grid">
				<tbody>
					{data.map((skill) => (
						<tr key={skill.category}>
							<td className="k">{skill.category}</td>
							<td>{skill.items.join("  ·  ")}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}
