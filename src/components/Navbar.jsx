import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          📅 Organizador Diário
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/meetings">Reuniões</Link></li>
          <li><Link to="/clients">Clientes</Link></li>
          <li><Link to="/quotes">Orçamentos</Link></li>
          <li><Link to="/sales">Vendas</Link></li>
          <li><Link to="/reminders">Lembretes</Link></li>
        </ul>
        <button onClick={handleSignOut} className="navbar-logout">
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
