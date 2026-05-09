import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Sidebar({ collapsed, onToggle, username }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : 'sidebar--expanded'}`}>
      {!collapsed && (
        <div className="sidebar__next">
          <button className="btn--next">NEXT</button>
        </div>
      )}

      {!collapsed && (
        <div className="sidebar__section">
          <h4 className="sidebar__heading">Course</h4>
          <ul className="sidebar__list">
            <li className="sidebar__chapter">Chapter 1</li>
            <li className="sidebar__item">part 1</li>
            <li className="sidebar__item">part 2</li>
            <li className="sidebar__chapter">Chapter 2</li>
            <li className="sidebar__item">part 1</li>
            <li className="sidebar__item">part 2</li>
            <li className="sidebar__chapter">Chapter 3</li>
            <li className="sidebar__item">part 1</li>
            <li className="sidebar__item">part 2</li>
            <li className="sidebar__chapter">Chapter 4</li>
            <li className="sidebar__item">part 1</li>
            <li className="sidebar__item">part 2</li>
          </ul>
        </div>
      )}

      {!collapsed && (
        <div className="sidebar__section">
          <h4 className="sidebar__heading">Campaigns</h4>
          <ul className="sidebar__list">
            <li className="sidebar__item--main">Campaign name</li>
            <li className="sidebar__item">Characters</li>
            <li className="sidebar__item">Locations</li>
            <li className="sidebar__item">Other</li>
          </ul>
        </div>
      )}

      <div className="sidebar__spacer" />

      {!collapsed && (
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="sidebar__username">{username}</span>
        </div>
      )}

      <div className="sidebar__toggle">
        <button onClick={onToggle} className="toggle-btn" aria-label="Toggle sidebar">
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

function DashboardCard({ title, children }) {
  return (
    <div className="dashboard-card">
      <h3 className="dashboard-card__title">{title}</h3>
      <div className="dashboard-card__content">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        username={user.username}
      />

      <div className="main-area">
        <header className="top-header">
          <h1 className="top-header__title">The DM’s Grimoire</h1>
          <div className="top-header__user">
            <div className="top-header__avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="top-header__username">{user.username}</span>
            <button onClick={handleLogout} className="btn--logout">
              Log out
            </button>
          </div>
        </header>

        <main className="main-content">
          <div className="cards-grid">
            <DashboardCard title="Last Course">
              <p>Chapter 2 – Building Encounters (resume here)</p>
            </DashboardCard>
            <DashboardCard title="Current Campaign">
              <p>The Lost Mines of Phandelver</p>
              <ul className="card-list">
                <li>3 active characters</li>
                <li>2 locations open</li>
              </ul>
            </DashboardCard>
            <DashboardCard title="Character Sheets">
              <p className="text-muted">No character sheets yet. Create one to get started.</p>
            </DashboardCard>
            <DashboardCard title="Quick Stats">
              <p>2 courses completed</p>
              <p>1 campaign in progress</p>
            </DashboardCard>
          </div>
        </main>
      </div>
    </div>
  );
}