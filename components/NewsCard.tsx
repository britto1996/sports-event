"use client";

import Link from 'next/link';
import Image from 'next/image';

interface NewsProps {
    id: string;
    title: string;
    summary: string;
    image: string;
    date: string;
}

const NewsCard = ({ news }: { news: NewsProps }) => {
    // Fix hydration for dates
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
				timeZone: 'UTC'
            }).toUpperCase();
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="card news-card">
            <div className="news-image-wrapper">
                <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="news-image"
                />
            </div>
            <div className="news-content">
                <span className="news-date">{formatDate(news.date)}</span>
                <h3 className="news-title">
                    <Link href={`/news/${news.id}`} className="hover:text-primary transition-colors duration-200">
                        {news.title}
                    </Link>
                </h3>
                <p className="news-summary">{news.summary}</p>
                <Link href={`/news/${news.id}`} className="read-more-btn">
                    READ STORY &rarr;
                </Link>
            </div>

            <style jsx>{`
        .news-card {
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s ease;
            background: var(--surface-0);
            border: 1px solid var(--border-subtle);
        }
        
        .news-card:hover {
            border-color: var(--accent);
        }

        .news-image-wrapper {
            height: 300px;
            overflow: hidden;
            position: relative;
        }
        
        .news-image {
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        .news-card:hover :global(.news-image) {
            transform: scale(1.1);
        }
        
        .news-content {
            padding: 2.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .news-date {
            font-size: 0.75rem;
            color: var(--accent);
            margin-bottom: 1rem;
            font-weight: 800;
            letter-spacing: 2px;
        }
        
        .news-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.1;
            font-weight: 900;
            letter-spacing: -0.5px;
        }
        
        .news-summary {
            color: var(--muted);
            font-size: 1rem;
            margin-bottom: 2rem;
            flex: 1;
            line-height: 1.5;
            font-weight: 500;
        }
        
        .read-more-btn {
            font-size: 0.8rem;
            color: var(--foreground);
            font-weight: 900;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .read-more-btn:hover {
            color: var(--accent);
        }
      `}</style>
        </div>
    );
};

export default NewsCard;
