import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState({});

  const { chapters, statuses, progress } = useCourse();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { chapterSlug, partSlug } = useParams();

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

  const handleNext = () => {
    if (!nextPage) return;
    if (nextPage.type === 'chapter') navigate(`/course/${nextPage.chapter.slug}`);
    else navigate(`/course/${nextPage.chapter.slug}/${nextPage.part.slug}`);
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

    if (chapterCompleted) return 'text-green-400';
    if (isCurrent) return 'text-yellow-400';
    return 'text-gray-400';
  };

    const getPartColor = (part, chapterId) => {
        const partStatus = statuses.parts[part.id];
        const completed = partStatus?.completed;
        const isCurrent = progress &&
            progress.last_chapter_id === chapterId &&  
            progress.last_part_id === part.id;

        if (isCurrent) return 'text-yellow-400';
        if (completed) return 'text-green-400';
        return 'text-gray-400';
    };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : 'sidebar--expanded'}`}>
      {!collapsed && (
        <>
          <div className="sidebar__next">
            <button
              className="btn--next"
              onClick={handleNext}
              disabled={!nextPage}
            >
              NEXT
            </button>
          </div>

          <div className="sidebar__section">
            <ul className="sidebar__list">
              <li
                className="sidebar__item--main cursor-pointer hover:text-white"
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
                  <div className="flex items-center justify-between">
                    <div
                        className={`sidebar__chapter cursor-pointer hover:text-white transition-colors ${getChapterColor(ch)}`}
                        onClick={() => navigate(`/course/${ch.slug}`)}
                    >
                        {ch.title}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleChapterCollapse(ch.id); }}
                        className="text-gray-500 hover:text-white ml-2 focus:outline-none text-xl leading-none"
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
                                className={`sidebar__item cursor-pointer hover:text-white transition-colors ${getPartColor(p, ch.id)}`}
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
            <h4 className="sidebar__heading">Campaigns</h4>
            <ul className="sidebar__list">
              <li className="sidebar__item--main">Campaign name</li>
              <li className="sidebar__item">Characters</li>
              <li className="sidebar__item">Locations</li>
              <li className="sidebar__item">Other</li>
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