import { useParams } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useEffect } from 'react';

export default function PartPage() {
	const { chapterSlug, partSlug } = useParams();
	const { chapters, updateProgress, toggleComplete, statuses } = useCourse();
	const chapter = chapters.find(ch => ch.slug === chapterSlug);
	const part = chapter?.parts.find(p => p.slug === partSlug);
	const completed = part ? statuses.parts[part.id]?.completed : false;

	useEffect(() => {
		console.log('PartPage statuses', statuses);
	}, [statuses]);

	useEffect(() => {
		if (chapter && part) {
			updateProgress(chapter.id, part.id);
		}
	}, [chapter, part, updateProgress]);

	const handleToggle = () => {
		if (part) toggleComplete('part', part.id);
	};

	if (!chapter || !part) return <div className="part-not-found">Part not found.</div>;

	return (
		<article className="course-page">
			<h2 className="course-page__title">{part.title}</h2>
			<div className="course-page__content" dangerouslySetInnerHTML={{ __html: part.content }} />
			{part.video_url && (
				<div className="course-page__video">
					<iframe
						width="100%"
						height="400"
						src={part.video_url.replace('watch?v=', 'embed/')}
						title="Course video"
						frameBorder="0"
						allowFullScreen
					/>
				</div>
			)}
			<div className="part-button-container">
				<button
					onClick={handleToggle}
					className={`part-toggle-btn ${
						completed ? 'part-toggle-btn--completed' : 'part-toggle-btn--incomplete'
					}`}
				>
					{completed ? 'Completed' : 'Mark as Complete'}
				</button>
			</div>
		</article>
	);
}