import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
    const { user } = useAuth();
    const [chapters, setChapters] = useState([]);
    const [progress, setProgress] = useState(null);
    const [statuses, setStatuses] = useState({ chapters: {}, parts: {} }); // { chapters: { [id]: bool }, parts: { [id]: bool } }
    const [loading, setLoading] = useState(true);

    const fetchCourse = () => {
        fetch('/api/course')
        .then(res => res.json())
        .then(data => setChapters(data))
        .catch(console.error);
    };

    const fetchProgress = useCallback(() => {
        if (user) {
        fetch('/api/progress')
            .then(res => res.json())
            .then(data => setProgress(data))
            .catch(console.error);
        }
    }, [user]);

    const fetchStatuses = useCallback(() => {
        if (user) {
            console.log('fetching statuses');
            fetch('/api/statuses', { cache: 'no-cache' })
                .then(res => res.json())
                .then(data => {
                    console.log('new statuses:', data);
                    setStatuses(data);
                })
            .catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCourse();
            fetchProgress();
            fetchStatuses();
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [user, fetchProgress, fetchStatuses]);

    const updateProgress = useCallback(async (chapterId, partId = null) => {
        setProgress({ last_chapter_id: chapterId, last_part_id: partId });
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapter_id: chapterId, part_id: partId })
        });
        } catch (err) {
            console.error('failed to update prgress:', err);
        }
    }, []);

    const markVisited = useCallback(async (itemType, itemId) => {
        try {
            await fetch('/api/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_type: itemType, item_id: itemId }),
            });
            setStatuses(prev => {
                const key = itemType === 'part' ? 'parts' : 'chapters';
                const current = prev[key][itemId] || { visited: false, completed: false };
                return {
                    ...prev,
                    [key]: {
                        ...prev[key],
                        [itemId]: { ...current, visited: true }
                    }
                };
            });
        } catch (err) {
            console.error('visit failed:', err);
        }
    }, []);

    const toggleComplete = useCallback(async (itemType, itemId) => {
        try {
            await fetch('/api/toggle-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_type: itemType, item_id: itemId }),
            });
            fetchStatuses();
        } catch (err) {
            console.error('toggle complete failed:', err);
        }
    }, [fetchStatuses]);

    const lastVisitedItem = useMemo(() => {
        if (!chapters.length || !progress) return null;
        const { last_chapter_id, last_part_id } = progress;
        if (last_part_id) {
            for (const ch of chapters) {
                const part = ch.parts.find(p => p.id === last_part_id);
                if (part) return { type: 'part', chapter: ch, part };
            }
        } else {
            const chapter = chapters.find(ch => ch.id === last_chapter_id);
            if (chapter) return { type: 'chapter', chapter };
        }
        return null;
    }, [progress, chapters]);

    const nextItem = useMemo(() => {
        if (!chapters.length) return null;
        if (!progress) {
            return { type: 'chapter', chapter: chapters[0] };
        }

        const flat = [];
        chapters.forEach(ch => {
            flat.push({ type: 'chapter', chapter: ch });
            ch.parts.forEach(p => flat.push({ type: 'part', chapter: ch, part: p }));
        });

        const { last_chapter_id, last_part_id } = progress;
        const idx = flat.findIndex(item => {
            if (item.type === 'chapter') {
                return item.chapter.id === last_chapter_id && last_part_id === null;
            }
            return item.part.id === last_part_id;
        });

        if (idx === -1) return flat[0];
        if (idx < flat.length - 1) return flat[idx + 1];
        return null;
    }, [progress, chapters]);

    const advanceToNextItem = useCallback(() => {
        if (!nextItem) return;
        const { type, chapter, part } = nextItem;
        updateProgress(
        chapter.id,
        type === 'part' ? part.id : null
        );
    }, [nextItem, updateProgress]);

    return (
        <CourseContext.Provider
        value={{
            chapters,
            progress,
            statuses,
            updateProgress,
            markVisited,
            toggleComplete,
            loading,
            lastVisitedItem,
            nextItem,
            advanceToNextItem,
        }}
        >
        {children}
        </CourseContext.Provider>
    );
};

export function useCourse() {
    const ctx = useContext(CourseContext);
    if (!ctx) throw new Error('useCourse must be used within CourseProvider');
    return ctx;
}