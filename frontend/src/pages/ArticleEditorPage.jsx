import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../context/CampaignContext';

export default function ArticleEditorPage() {
	const { articleId } = useParams();
	const navigate = useNavigate();
	const { setLastArticleId, setLastCampaignId } = useCampaigns();

	const [article, setArticle] = useState(null);
	const [title, setTitle] = useState('');
	const [primaryContent, setPrimaryContent] = useState('');
	const [sections, setSections] = useState([]);
	const [newSectionTitle, setNewSectionTitle] = useState('');
	const [newSectionText, setNewSectionText] = useState('');

	useEffect(() => {
		if (articleId) {
			setLastArticleId(Number(articleId));
		}
	}, [articleId, setLastArticleId]);

	useEffect(() => {
		if (!articleId) return;
		fetch(`/api/articles/${articleId}`)
			.then(res => res.json())
			.then(data => {
				setArticle(data);
				setTitle(data.title);
				setPrimaryContent(data.primary_content || '');
				setSections(data.sections || []);

				setLastArticleId(Number(articleId));
				if (data.campaign_id) {
					setLastCampaignId(data.campaign_id);
				}
			});
	}, [articleId]);

	const handleSaveArticle = async () => {
		try {
			await fetch(`/api/articles/${articleId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title, primary_content: primaryContent }),
			});
		} catch (err) {
			console.error('Save failed', err);
		}
	};

	const handleAddSection = async () => {
		if (!newSectionTitle.trim()) return;
		try {
			const res = await fetch(`/api/sections?article_id=${articleId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					section_title: newSectionTitle,
					section_text: newSectionText,
				}),
			});
			const newSec = await res.json();
			setSections(prev => [...prev, newSec]);
			setNewSectionTitle('');
			setNewSectionText('');
		} catch (err) {
			console.error('Failed to add section', err);
		}
	};

	const handleUpdateSection = async (sectionId, field, value) => {
		setSections(prev =>
			prev.map(s => (s.id === sectionId ? { ...s, [field]: value } : s))
		);
		try {
			await fetch(`/api/sections/${sectionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ [field]: value }),
			});
		} catch (err) {
			console.error('Failed to update section', err);
		}
	};

	const handleDeleteSection = async (sectionId) => {
		if (!window.confirm('Delete this section?')) return;
		try {
			await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
			setSections(prev => prev.filter(s => s.id !== sectionId));
		} catch (err) {
			console.error('Failed to delete section', err);
		}
	};

	if (!article) {
		return <div className="article-editor__loading">Loading article...</div>;
	}

	return (
		<div className="article-editor__page">
			<button
				onClick={() => navigate(-1)}
				className="article-editor__back-btn"
			>
				&larr; Back
			</button>

			<div className="article-editor__layout">
				<div className="article-editor__main">
					<input
						type="text"
						value={title}
						onChange={e => setTitle(e.target.value)}
						className="article-editor__title-input"
						placeholder="Article title"
						onBlur={handleSaveArticle}
					/>

					<textarea
						value={primaryContent}
						onChange={e => setPrimaryContent(e.target.value)}
						rows={30}
						className="article-editor__textarea"
						placeholder="Write your main content here…"
						onBlur={handleSaveArticle}
					/>

					<div className="article-editor__save-bar">
						<button
							onClick={handleSaveArticle}
							className="article-editor__save-btn"
						>
							Save
						</button>
						<span className="article-editor__autosave-text">dw, ts saves automatically... allegedly at least</span>
					</div>
				</div>

				<div className="article-editor__sidebar">
					<div className="article-editor__sections-box">
						<h3 className="article-editor__sections-heading">Sections</h3>

						{sections.length === 0 && (
							<p className="article-editor__empty-sections">No sections yet. Add some info about this article.</p>
						)}

						{sections.map(sec => (
							<div key={sec.id} className="article-editor__section-item">
								<div className="article-editor__section-header">
									<input
										className="article-editor__section-title-input"
										value={sec.section_title}
										onChange={e => handleUpdateSection(sec.id, 'section_title', e.target.value)}
										placeholder="Section title"
									/>
									<button
										onClick={() => handleDeleteSection(sec.id)}
										className="article-editor__delete-btn"
										title="Delete section"
									>
										✕
									</button>
								</div>

								<textarea
									className="article-editor__section-textarea"
									rows={3}
									value={sec.section_text}
									onChange={e => handleUpdateSection(sec.id, 'section_text', e.target.value)}
									placeholder="Value"
								/>
							</div>
						))}

						<div className="article-editor__add-section-divider">
							<input
								type="text"
								placeholder="Title (e.g. Age, Race)"
								value={newSectionTitle}
								onChange={e => setNewSectionTitle(e.target.value)}
								className="article-editor__add-input"
							/>
							<textarea
								placeholder="Value"
								value={newSectionText}
								onChange={e => setNewSectionText(e.target.value)}
								className="article-editor__add-input"
								rows={2}
							/>
							<button
								onClick={handleAddSection}
								className="article-editor__add-btn"
							>
								Add Section
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}