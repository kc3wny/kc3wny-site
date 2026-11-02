import { getProjectPdf } from "@/lib/project-pdf-cache";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

// Rendered once per project at build time and served as a static file —
// nothing here varies per request, and a cold react-pdf render with image
// downscaling takes a few seconds. Projects that haven't changed since the
// last build are reused from the build cache (lib/project-pdf-cache.ts).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
	return getAllProjects().map((project) => ({ slug: project.slug }));
}

/** Same RFC 6266 shape as the content-image route: ASCII fallback + UTF-8 name. */
function contentDisposition(filename: string): string {
	const asciiFallback = filename
		.replace(/[^\x20-\x7e]/g, "_")
		.replace(/["\\/]/g, "");
	return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const project = getProjectBySlug(slug);
	if (!project) return new Response("Project not found", { status: 404 });

	const pdf = await getProjectPdf(project);
	return new Response(new Uint8Array(pdf), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": contentDisposition(
				`${project.title.replaceAll("/", "-")} - KC3WNY.pdf`,
			),
		},
	});
}
