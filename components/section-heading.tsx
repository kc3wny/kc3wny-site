/**
 * Section heading with a self-referencing § citation anchor.
 * Renders <h2 id={id}> so any section can be linked/cited directly, e.g.
 * /#contact or /projects/meshbase#s2. The § mark links to its own section.
 */
type SectionHeadingProps = {
	/** Section number shown after the § mark (1, 2, 3, …) */
	readonly num: number | string;
	readonly title: string;
	/** DOM id / citation anchor for this section */
	readonly id: string;
};

export function SectionHeading({ num, title, id }: SectionHeadingProps) {
	return (
		<h2 className="sec" id={id}>
			<a className="anchor" href={`#${id}`}>
				§{num}
			</a>
			{title}
		</h2>
	);
}
