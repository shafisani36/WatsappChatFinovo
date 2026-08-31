import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #eaeef2',
      padding: '12px 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" style={{ 
            fontSize: '20px', 
            fontWeight: 700,
            color: '#1a2332',
            textDecoration: 'none',
          }}>
            ⏱️ TimeTracker
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: '#4b5563' }}>
                  Dashboard
                </Link>
                <Link to="/clock" style={{ textDecoration: 'none', color: '#4b5563' }}>
                  Clock In/Out
                </Link>
                <Link to="/history" style={{ textDecoration: 'none', color: '#4b5563' }}>
                  History
                </Link>
                <Link to="/reports" style={{ textDecoration: 'none', color: '#4b5563' }}>
                  Reports
                </Link>
                {isManager && (
                  <Link to="/team-report" style={{ textDecoration: 'none', color: '#4b5563' }}>
                    Team Report
                  </Link>
                )}
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  👤 {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '6px 16px', fontSize: '13px' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;