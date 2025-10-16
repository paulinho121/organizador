import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          📅 Organizador Diário
        </Link>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
        <ul className={menuOpen ? 'navbar-menu active' : 'navbar-menu'}>
          <li onClick={() => setMenuOpen(false)}><Link to="/dashboard">Dashboard</Link></li>
          <li onClick={() => setMenuOpen(false)}><Link to="/meetings">Reuniões</Link></li>
          <li onClick={() => setMenuOpen(false)}><Link to="/clients">Clientes</Link></li>
          <li onClick={() => setMenuOpen(false)}><Link to="/quotes">Orçamentos</Link></li>
          <li onClick={() => setMenuOpen(false)}><Link to="/sales">Vendas</Link></li>
          <li onClick={() => setMenuOpen(false)}><Link to="/reminders">Lembretes</Link></li>
        </ul>
        <button onClick={handleSignOut} className="navbar-logout">
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
