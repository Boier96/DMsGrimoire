import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="loading-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-area">
        <header className="top-header">
          <h1 className="top-header__title">The DM’s Grimoire</h1>
          <div className="top-header__user">
            <div className="top-header__avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="top-header__username">{user.username}</span>
            <button onClick={handleLogout} className="btn--logout">Log out</button>
          </div>
        </header>
        <main className="main-content">
          <Outlet />  
        </main>
      </div>
    </div>
  );
}