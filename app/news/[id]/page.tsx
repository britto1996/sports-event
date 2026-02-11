import mockDataRaw from '@/data/mockData.json';
import Image from 'next/image';
import Link from 'next/link';
import type { MockData } from '@/types/mockData';

const mockData = mockDataRaw as MockData;

export default function NewsDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const article = mockData.news.find((n) => n.id === params.id);

	if (!article) {
		return (
			<div className="container" style={{ padding: '8rem 2rem' }}>
				<h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem' }}>STORY NOT FOUND</h1>
				<p style={{ color: '#888', marginBottom: '2.5rem' }}>This article isn’t available in the current mock dataset.</p>
				<Link href="/" className="btn">
					Back to Home
				</Link>
			</div>
		);
	}

	const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	});

	const moreStories = mockData.news.filter((n) => n.id !== article.id).slice(0, 2);

	return (
		<div className="container" style={{ padding: '8rem 2rem' }}>
			<Link
				href="/"
				style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', marginBottom: '2.5rem', display: 'inline-block', letterSpacing: '2px', fontWeight: 800 }}
			>
				&larr; Back
			</Link>

		<div style={{ maxWidth: 980, margin: '0 auto' }}>
			<p style={{ color: 'var(--accent)', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{formattedDate}</p>
			<h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 0.9, marginBottom: '1.5rem' }}>{article.title}</h1>
			<p style={{ color: '#888', fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '2.5rem' }}>{article.summary}</p>

			<div style={{ position: 'relative', width: '100%', height: 520, border: '1px solid #111', background: '#000', marginBottom: '2.5rem' }}>
				<Image src={article.image} alt={article.title} fill sizes="(max-width: 1024px) 100vw, 980px" style={{ objectFit: 'cover' }} priority />
			</div>

			<div style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: 1.9, fontWeight: 500 }}>
				<p>
					{article.summary}
				</p>
				<p style={{ marginTop: '1.5rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, fontSize: '0.8rem' }}>
					More story content will be added when available.
				</p>
			</div>
		</div>

		{moreStories.length > 0 && (
			<div style={{ marginTop: '6rem' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
					<h2 style={{ fontSize: '2rem', fontWeight: 900 }}>MORE STORIES</h2>
					<Link href="/" style={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: '1px', borderBottom: '2px solid var(--accent)', paddingBottom: 4 }}>
						VIEW LATEST
					</Link>
				</div>
				<div className="grid-3">
					{moreStories.map((n) => (
						<Link key={n.id} href={`/news/${n.id}`} className="card" style={{ padding: '2rem', border: '1px solid #111' }}>
							<p style={{ color: 'var(--accent)', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{new Date(n.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</p>
							<p style={{ fontWeight: 900, fontSize: '1.2rem', lineHeight: 1.1, marginBottom: '0.75rem' }}>{n.title}</p>
							<p style={{ color: '#666', fontWeight: 600, lineHeight: 1.5 }}>{n.summary}</p>
						</Link>
					))}
				</div>
			</div>
		)}
	</div>
	);
}
