import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashboardCard';

function extractText(html, max = 200) {
	const div = document.createElement('div');
	div.innerHTML = html;
	const text = div.textContent || div.innerText || '';
	return text.length > max ? text.substring(0, max) + '...' : text;
}

function extractFirstImage(html) {
	const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
	return match ? match[1] : null;
}

function getYouTubeThumbnail(url) {
	if (!url) return null;
	const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/);
	return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : null;
}

export default function LastCourseCard({ lastVisitedItem }) {
	const navigate = useNavigate();

	const type = lastVisitedItem?.type;
	const chapter = lastVisitedItem?.chapter;
	const part = lastVisitedItem?.part;
	const contentHtml = type === 'part' && part ? part.content : chapter?.content || '';
	const videoUrl = type === 'part' && part ? part.video_url : null;

	const excerpt = useMemo(() => extractText(contentHtml), [contentHtml]);
	const firstImage = useMemo(() => extractFirstImage(contentHtml), [contentHtml]);
	const thumbnail = useMemo(() => getYouTubeThumbnail(videoUrl), [videoUrl]);

	const handleTitleClick = () => {
		if (!lastVisitedItem) return;
		if (type === 'part') {
			navigate(`/course/${chapter.slug}/${part.slug}`);
		} else {
			navigate(`/course/${chapter.slug}`);
		}
	};

	if (!lastVisitedItem) {
		return (
			<DashboardCard title="Last Seen">
				<p className="text-muted">Get started, and this will be useful, allegedly</p>
			</DashboardCard>
		);
	}

	return (
		<DashboardCard title="Last Course">
			<h3
				onClick={handleTitleClick}
				className="last-course-title"
			>
				{type === 'part' ? part.title : chapter.title}
			</h3>

			<div className="last-course-preview">
				{firstImage && !thumbnail && (
					<img
						src={firstImage}
						alt="Preview"
						className="last-course-image"
					/>
				)}

				{thumbnail && !firstImage && (
					<div className="last-course-video-container">
						<img
							src={thumbnail}
							alt="Video thumbnail"
							className="last-course-video-thumb"
						/>
						<div className="last-course-play-overlay">
							<svg className="last-course-play-icon" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
						</div>
					</div>
				)}

				{thumbnail && firstImage && (
					<div className="last-course-badge-wrapper">
						<img
							src={firstImage}
							alt="Preview"
							className="last-course-image"
						/>
						<div className="last-course-badge">
							Video available
						</div>
					</div>
				)}

				<p className="last-course-excerpt">{excerpt}</p>
			</div>
		</DashboardCard>
	);
}