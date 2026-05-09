import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { useCampaigns } from '../context/CampaignContext';

function Sidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const [collapsedChapters, setCollapsedChapters] = useState({});

	const { chapters, statuses, progress, nextItem, advanceToNextItem } = useCourse();
	const { user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { chapterSlug, partSlug } = useParams();

	const { campaigns, activeCampaignId, sidebarRefresh } = useCampaigns();

	const [collapsedCampaigns, setCollapsedCampaigns] = useState({});
	const [campaignFolders, setCampaignFolders] = useState({});
	const [folderArticles, setFolderArticles] = useState({});
	const [collapsedFolders, setCollapsedFolders] = useState({});

	useEffect(() => {
		setCampaignFolders({});
		setFolderArticles({});
	}, [sidebarRefresh]);

	useEffect(() => {
		if (campaigns.length > 0) {
			const initialState = {};
			campaigns.forEach(c => {
				initialState[c.id] = true;
			});
			setCollapsedCampaigns(prev => ({ ...initialState, ...prev }));
		}
	}, [campaigns]);

	const loadFolders = useCallback(async (campaignId) => {
		if (campaignFolders[campaignId]) return;
		try {
			const res = await fetch(`/api/folders?campaign_id=${campaignId}`);
			const data = await res.json();
			setCampaignFolders(prev => ({ ...prev, [campaignId]: data }));
		} catch (err) {
			console.error('Failed to load folders', err);
		}
	}, [campaignFolders]);

	const loadArticles = useCallback(async (folderId) => {
		if (folderArticles[folderId]) return;
		try {
			const res = await fetch(`/api/articles?folder_id=${folderId}`);
			const data = await res.json();
			setFolderArticles(prev => ({ ...prev, [folderId]: data }));
		} catch (err) {
			console.error('Failed to load articles', err);
		}
	}, [folderArticles]);

	const toggleCampaign = (campaignId) => {
		setCollapsedCampaigns(prev => {
			const current = prev[campaignId];
			const newState = current !== false ? false : true;
			return { ...prev, [campaignId]: newState };
		});
		if (collapsedCampaigns[campaignId] !== false) {
			loadFolders(campaignId);
		}
	};

	const toggleFolder = (folderId) => {
		setCollapsedFolders(prev => {
			const current = prev[folderId];
			const newState = current !== false ? false : true;
			return { ...prev, [folderId]: newState };
		});
		if (collapsedFolders[folderId] !== false) {
			loadArticles(folderId);
		}
	};

	const campaignChevron = (cId) => (collapsedCampaigns[cId] !== false ? '▸' : '▾');
	const folderChevron = (fId) => (collapsedFolders[fId] !== false ? '▸' : '▾');

	const pageList = [];
	chapters.forEach(ch => {
		pageList.push({ type: 'chapter', chapter: ch });
		ch.parts.forEach(p => {
			pageList.push({ type: 'part', chapter: ch, part: p });
		});
	});

	const currentIdx = pageList.findIndex(item => {
		if (item.type === 'chapter') return location.pathname === `/course/${item.chapter.slug}`;
		if (item.type === 'part')    return location.pathname === `/course/${item.chapter.slug}/${item.part.slug}`;
		return false;
	});
	const nextPage = currentIdx >= 0 && currentIdx < pageList.length - 1 ? pageList[currentIdx + 1] : null;

	const isDashboard = location.pathname === '/dashboard';
	const nextAvailable = isDashboard ? nextItem : nextPage;

	const handleNext = () => {
		if (isDashboard) {
			if (nextItem) advanceToNextItem();
		} else {
			if (!nextPage) return;
			if (nextPage.type === 'chapter') navigate(`/course/${nextPage.chapter.slug}`);
			else navigate(`/course/${nextPage.chapter.slug}/${nextPage.part.slug}`);
		}
	};

	const toggleChapterCollapse = (chapterId) => {
		setCollapsedChapters(prev => ({
			...prev,
			[chapterId]: !prev[chapterId]
		}));
	};

	const getChapterColor = (chapter) => {
		const chapterStatus = statuses.chapters[chapter.id];
		const partsCompleted = chapter.parts.every(p => statuses.parts[p.id]?.completed);
		const chapterCompleted = chapterStatus?.completed || partsCompleted;
		const isCurrent = progress &&
			progress.last_chapter_id === chapter.id &&
			!progress.last_part_id;

		if (chapterCompleted) return 'sidebar__chapter--completed';
		if (isCurrent) return 'sidebar__chapter--current';
		return 'sidebar__chapter--default';
	};

	const getPartColor = (part, chapterId) => {
		const partStatus = statuses.parts[part.id];
		const completed = partStatus?.completed;
		const isCurrent = progress &&
			progress.last_chapter_id === chapterId &&
			progress.last_part_id === part.id;

		if (isCurrent) return 'sidebar__part--current';
		if (completed) return 'sidebar__part--completed';
		return 'sidebar__part--default';
	};

	return (
		<aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : 'sidebar--expanded'}`}>
			{!collapsed && (
				<>
					<div className="sidebar__next">
						<button
							className="btn--next"
							onClick={handleNext}
							disabled={!nextAvailable}
						>
							NEXT
						</button>
					</div>

					<div className="sidebar__section">
						<ul className="sidebar__list">
							<li
								className="sidebar__item--main"
								onClick={() => navigate('/dashboard')}
							>
								Dashboard
							</li>
						</ul>
					</div>

					<div className="sidebar__section">
						<h4 className="sidebar__heading">Course</h4>
						<ul className="sidebar__list">
							{chapters.map(ch => (
								<li key={ch.id}>
									<div className="sidebar__row">
										<div
											className={`sidebar__chapter ${getChapterColor(ch)}`}
											onClick={() => navigate(`/course/${ch.slug}`)}
										>
											{ch.title}
										</div>
										<button
											onClick={(e) => { e.stopPropagation(); toggleChapterCollapse(ch.id); }}
											className="sidebar__toggle-btn"
											aria-label="Toggle chapter parts"
										>
											{collapsedChapters[ch.id] ? '▸' : '▾'}
										</button>
									</div>
									{!collapsedChapters[ch.id] && (
										<ul>
											{ch.parts.map(p => (
												<li
													key={p.id}
													className={`sidebar__item ${getPartColor(p, ch.id)}`}
													onClick={() => navigate(`/course/${ch.slug}/${p.slug}`)}
												>
													{p.title}
												</li>
											))}
										</ul>
									)}
								</li>
							))}
						</ul>
					</div>

					<div className="sidebar__section">
						<h4
							className="sidebar__heading sidebar__heading--clickable"
							onClick={() => navigate('/campaigns')}
						>
							Campaigns
						</h4>

						<ul className="sidebar__list">
							{campaigns.length === 0 && (
								<li
									className="sidebar__item--main"
									onClick={() => navigate('/campaigns')}
								>
									No campaigns yet
								</li>
							)}
							{campaigns.map(c => (
								<li key={c.id}>
									<div className="sidebar__row">
										<div
											className={`campaign-item ${activeCampaignId === c.id ? 'campaign-item--active' : 'campaign-item--default'}`}
											onClick={() => navigate(`/campaigns/${c.id}`)}
										>
											{c.name}
										</div>
										<button
											onClick={(e) => { e.stopPropagation(); toggleCampaign(c.id); }}
											className="sidebar__toggle-btn"
										>
											{campaignChevron(c.id)}
										</button>
									</div>

									{collapsedCampaigns[c.id] === false && (
										<ul className="sidebar__list-nested">
											{(campaignFolders[c.id] || []).map(folder => (
												<li key={folder.id}>
													<div className="sidebar__folder-row">
														<button
															onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}
															className="sidebar__folder-toggle-btn"
														>
															{folderChevron(folder.id)}
														</button>
														<span
															className="sidebar__folder-item"
															onClick={() => navigate(`/campaigns/${c.id}`)}
														>
															{folder.name}
														</span>
													</div>

													{collapsedFolders[folder.id] === false && (
														<ul className="sidebar__list-nested--deep">
															{(folderArticles[folder.id] || []).map(article => (
																<li
																	key={article.id}
																	className="sidebar__article-item"
																	onClick={() => navigate(`/articles/${article.id}`)}
																>
																	{article.title}
																</li>
															))}
															{(folderArticles[folder.id] || []).length === 0 && (
																<li className="sidebar__message">No articles</li>
															)}
														</ul>
													)}
												</li>
											))}
											{(campaignFolders[c.id] || []).length === 0 && (
												<li className="sidebar__message">No folders</li>
											)}
										</ul>
									)}
								</li>
							))}
							<li
								className="sidebar__item--main sidebar__new-campaign"
								onClick={() => navigate('/campaigns')}
							>
								+ New Campaign
							</li>
						</ul>
					</div>

					<div className="sidebar__spacer" />

					<div className="sidebar__user">
						<div className="sidebar__avatar">
							{user.username.charAt(0).toUpperCase()}
						</div>
						<span className="sidebar__username">{user.username}</span>
					</div>
				</>
			)}

			<div className="sidebar__toggle">
				<button onClick={() => setCollapsed(prev => !prev)} className="toggle-btn" aria-label="Toggle sidebar">
					{collapsed ? (
						<svg xmlns="http://www.w3.org/2000/svg" className="toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" className="toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					)}
				</button>
			</div>
		</aside>
	);
}

export default Sidebar;