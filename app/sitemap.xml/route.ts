import { getAllProjects } from "@/lib/projects";

export async function GET() {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kc3wny.com";

	// Get all projects
	const projects = getAllProjects();

	// Build XML sitemap
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/sitemap</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ${projects
		.map((project) => {
			const date = new Date(project.publishedAt);
			const lastmod = Number.isNaN(date.getTime())
				? new Date().toISOString()
				: date.toISOString();
			return `<url>
    <loc>${baseUrl}/projects/${project.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
		})
		.join("\n  ")}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
