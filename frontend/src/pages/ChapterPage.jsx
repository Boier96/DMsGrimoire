import { useParams } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useEffect } from 'react';

export default function ChapterPage() {
	const { chapterSlug } = useParams();
	const { chapters, updateProgress, statuses } = useCourse();
	const chapter = chapters.find(ch => ch.slug === chapterSlug);

	useEffect(() => {
		if (chapter) {
			updateProgress(chapter.id, null);
		}
	}, [chapter, updateProgress]);

	if (!chapter) return <div className="text-gray-500 p-6">Chapter not found.</div>;

	const allPartsCompleted = chapter.parts.every(p => statuses.parts[p.id]?.completed);
	const isChapterCompleted = statuses.chapters[chapter.id]?.completed || allPartsCompleted;

	return (
		<article className="course-page">
			<h2 className="course-page__title">{chapter.title}</h2>
			{isChapterCompleted && (
				<div className="chapter-completed-badge">
					Chapter Completed
				</div>
			)}
			<div className="course-page__content" dangerouslySetInnerHTML={{ __html: chapter.content }} />
		</article>
	);
}