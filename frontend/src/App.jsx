import React, { useState, useEffect } from 'react';

// Views
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Vendedores from './views/Vendedores';
import Apostadores from './views/Apostadores';
import Concursos from './views/Concursos';
import Sorteios from './views/Sorteios';
import SorteioOneClick from './views/SorteioOneClick';
import Wallet from './views/Wallet';
import AnaliseRisco from './views/AnaliseRisco';
import AnaliseConsultores from './views/AnaliseConsultores';

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('inovaloto_token');
    const name = localStorage.getItem('inovaloto_user_name');
    const role = localStorage.getItem('inovaloto_user_role');
    return (token && name && role) ? { name, role } : null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const validPages = ['dashboard', 'vendedores', 'apostadores', 'concursos', 'sorteios', '1click', 'wallet', 'maparisco', 'analise'];
    return validPages.includes(hash) ? hash : 'dashboard';
  });
  
  useEffect(() => {
    // Listen for hash changes (e.g. back/forward buttons)
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validPages = ['dashboard', 'vendedores', 'apostadores', 'concursos', 'sorteios', '1click', 'wallet', 'maparisco', 'analise'];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Initialize simplebar manually
    setTimeout(() => {
      const sidebarScroll = document.getElementById('sidebar-scroll');
      if (sidebarScroll && window.SimpleBar) {
        new window.SimpleBar(sidebarScroll, { autoHide: true });
      }
    }, 200);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const toggleSidebar = (e) => {
    e.preventDefault();
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.app__offcanvas-overlay');
    
    if (sidebar) {
      if (window.innerWidth > 0 && window.innerWidth <= 1199) {
        sidebar.classList.toggle('close_sidebar');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    }
    if (overlay) {
      overlay.classList.toggle('overlay-open');
    }
  };

  const closeSidebarOverlay = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.app__offcanvas-overlay');
    if (sidebar) {
      sidebar.classList.remove('collapsed');
      sidebar.classList.remove('close_sidebar');
    }
    if (overlay) {
      overlay.classList.remove('overlay-open');
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    const hash = window.location.hash.replace('#', '');
    const validPages = ['dashboard', 'vendedores', 'apostadores', 'concursos', 'sorteios', '1click', 'wallet', 'maparisco', 'analise'];
    const initialPage = validPages.includes(hash) ? hash : 'dashboard';
    window.location.hash = initialPage;
    setCurrentPage(initialPage);
  };

  const handleLogout = () => {
    localStorage.removeItem('inovaloto_token');
    localStorage.removeItem('inovaloto_user_role');
    localStorage.removeItem('inovaloto_user_name');
    localStorage.removeItem('inovaloto_tenant_name');
    window.location.hash = '';
    setUser(null);
  };

  const navigate = (page, e) => {
    if (e) e.preventDefault();
    window.location.hash = page;
    setCurrentPage(page);
    
    if (window.innerWidth < 991) {
      closeSidebarOverlay();
    }
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard user={user} onNavigate={setCurrentPage} />;
      case 'vendedores': return <Vendedores />;
      case 'apostadores': return <Apostadores />;
      case 'concursos': return <Concursos />; // Can act as bilhetes/concursos
      case 'sorteios': return <Sorteios />;
      case '1click': return <SorteioOneClick onNavigate={setCurrentPage} />;
      case 'wallet': return <Wallet />;
      case 'maparisco': return <AnaliseRisco onNavigate={setCurrentPage} />;
      case 'analise': return <AnaliseConsultores onNavigate={setCurrentPage} />;
      default: return <Dashboard user={user} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="page__full-wrapper">
      
      {/* SIDEBAR EXATAMENTE COMO NO PROJETO BASE */}
      <div className="app-sidebar" id="sidebar">
        <div className="main-sidebar-header text-center mt-2">
          <a href="#dashboard" className="header-logo text-center mx-auto" onClick={(e) => navigate('dashboard', e)}>
            <img className="main-logo mx-auto" src="/assets/images/logo/inovalogo.png" alt="logo" />
            <img className="dark-logo mx-auto" src="/assets/images/logo/inovalogo.png" alt="logo" />
            <small className="mt-1 text-muted">Versão 2.0.0</small>
          </a>
        </div>
        
        <div className="main-sidebar" id="sidebar-scroll" style={{ height: 'calc(100vh - 90px)', marginTop: '75px', overflowY: 'auto', overflowX: 'hidden' }}>
          <nav className="main-menu-container nav nav-pills flex-column sub-open">
            <div className="sidebar-left" id="sidebar-left"></div>
            <ul className="main-menu">
              
              <li className="slide">
                <a href="#dashboard" className="sidebar__menu-item" onClick={(e) => navigate('dashboard', e)}>
                  <div className="side-menu__icon"><i className="icon-bar-chart"></i></div>
                  <span className="sidebar__menu-label">Dashboard</span>
                </a>
              </li>

              <li className="slide">
                <a href="#wallet" className="sidebar__menu-item" onClick={(e) => navigate('wallet', e)}>
                  <div className="side-menu__icon"><i className="icon-wallet"></i></div>
                  <span className="sidebar__menu-label">Carteira</span>
                </a>
              </li>

              {user.role === 'seller' && (
                <>
                  <li className="slide">
                    <a href="#faturas" className="sidebar__menu-item" onClick={(e) => navigate('faturas', e)}>
                      <div className="side-menu__icon"><i className="icon-file-invoice"></i></div>
                      <span className="sidebar__menu-label">Faturas</span>
                    </a>
                  </li>
                  <li className="slide">
                    <a href="#saques" className="sidebar__menu-item" onClick={(e) => navigate('saques', e)}>
                      <div className="side-menu__icon"><i className="fa-light fa-money-bill-transfer"></i></div>
                      <span className="sidebar__menu-label">Solicitar Saque</span>
                    </a>
                  </li>
                </>
              )}

              <li className="slide">
                <a href="#1click" className="sidebar__menu-item" onClick={(e) => navigate('1click', e)}>
                  <div className="side-menu__icon"><i className="icon-square-plus"></i></div>
                  <span className="sidebar__menu-label">1-Click add Sorteio</span>
                </a>
              </li>

              <li className="slide">
                <a href="#maparisco" className="sidebar__menu-item" onClick={(e) => navigate('maparisco', e)}>
                  <div className="side-menu__icon"><i className="icon-map"></i></div>
                  <span className="sidebar__menu-label">Mapa de Risco</span>
                </a>
              </li>

              <li className="slide">
                <a href="#analise" className="sidebar__menu-item" onClick={(e) => navigate('analise', e)}>
                  <div className="side-menu__icon"><i className="icon-chart-line"></i></div>
                  <span className="sidebar__menu-label">Análise de Consultores</span>
                </a>
              </li>

              <li className="sidebar__menu-category"><hr /></li>

              <li className="slide">
                <a href="#bilhetes" className="sidebar__menu-item" onClick={(e) => navigate('concursos', e)}>
                  <div className="side-menu__icon"><img src="/assets/images/logo/icon.png" alt="" width="18" /></div>
                  <span className="sidebar__menu-label">Bilhetes</span>
                </a>
              </li>

              <li className="slide">
                <a href="#sorteios" className="sidebar__menu-item" onClick={(e) => navigate('sorteios', e)}>
                  <div className="side-menu__icon"><img src="/assets/images/logo-lotomania.png" alt="" width="18" /></div>
                  <span className="sidebar__menu-label">Sorteios</span>
                </a>
              </li>

              <li className="slide">
                <a href="#apostadores" className="sidebar__menu-item" onClick={(e) => navigate('apostadores', e)}>
                  <div className="side-menu__icon"><i className="icon-user-group"></i></div>
                  <span className="sidebar__menu-label">Apostadores</span>
                </a>
              </li>

              <li className="slide">
                <a href="#vendedores" className="sidebar__menu-item" onClick={(e) => navigate('vendedores', e)}>
                  <div className="side-menu__icon"><i className="icon-badge-dollar"></i></div>
                  <span className="sidebar__menu-label">Vendedores</span>
                </a>
              </li>

              <li className="slide">
                <a href="#solicitacoes" className="sidebar__menu-item" onClick={(e) => navigate('solicitacoes', e)}>
                  <div className="side-menu__icon"><i className="icon-user-clock"></i></div>
                  <span className="sidebar__menu-label">Solicitações de Consultores</span>
                </a>
              </li>

              <li className="slide">
                <a href="#exclusao" className="sidebar__menu-item" onClick={(e) => navigate('exclusao', e)}>
                  <div className="side-menu__icon"><i className="icon-trash-can"></i></div>
                  <span className="sidebar__menu-label">Gerenciador de Exclusões</span>
                </a>
              </li>

              <li className="sidebar__menu-category"><hr /></li>

              <li className="slide">
                <a href="#tabela" className="sidebar__menu-item" onClick={(e) => navigate('tabela', e)}>
                  <div className="side-menu__icon"><i className="icon-table-list"></i></div>
                  <span className="sidebar__menu-label">Tabela de Premiações</span>
                </a>
              </li>

              <li className="slide">
                <a href="#resultados" className="sidebar__menu-item" onClick={(e) => navigate('resultados', e)}>
                  <div className="side-menu__icon"><i className="icon-money-check-dollar-pen"></i></div>
                  <span className="sidebar__menu-label">Resultados</span>
                </a>
              </li>

              <li className="slide">
                <a href="#ganhadores" className="sidebar__menu-item" onClick={(e) => navigate('ganhadores', e)}>
                  <div className="side-menu__icon"><i className="icon-trophy"></i></div>
                  <span className="sidebar__menu-label">Ganhadores</span>
                </a>
              </li>

              <li className="sidebar__menu-category"><hr /></li>

              <li className="slide">
                <a href="#config" className="sidebar__menu-item" onClick={(e) => navigate('config', e)}>
                  <div className="side-menu__icon"><i className="icon-gear-complex"></i></div>
                  <span className="sidebar__menu-label">Configurações</span>
                </a>
              </li>

              <li className="slide">
                <a href="#hist_descarregos" className="sidebar__menu-item" onClick={(e) => navigate('hist_descarregos', e)}>
                  <div className="side-menu__icon"><i className="icon-envelope-circle-check"></i></div>
                  <span className="sidebar__menu-label">Hist. Descarregos</span>
                </a>
              </li>

              <li className="slide">
                <a href="#permissions" className="sidebar__menu-item" onClick={(e) => navigate('permissions', e)}>
                  <div className="side-menu__icon"><i className="icon-file-shield"></i></div>
                  <span className="sidebar__menu-label">Permissões</span>
                </a>
              </li>

              <li className="slide">
                <a href="#logs" className="sidebar__menu-item" onClick={(e) => navigate('logs', e)}>
                  <div className="side-menu__icon"><i className="icon-table-list"></i></div>
                  <span className="sidebar__menu-label">Logs</span>
                </a>
              </li>

              <li className="slide">
                <a href="#seguranca" className="sidebar__menu-item" onClick={(e) => navigate('seguranca', e)}>
                  <div className="side-menu__icon"><i className="icon-shield-check"></i></div>
                  <span className="sidebar__menu-label">Segurança</span>
                </a>
              </li>

              {user.role === 'admin' && (
                <>
                  <li className="slide">
                    <a href="#admin_faturas" className="sidebar__menu-item" onClick={(e) => navigate('admin_faturas', e)}>
                      <div className="side-menu__icon"><i className="icon-file-invoice"></i></div>
                      <span className="sidebar__menu-label">Gestão de Faturas</span>
                    </a>
                  </li>
                  <li className="slide">
                    <a href="#admin_saques" className="sidebar__menu-item" onClick={(e) => navigate('admin_saques', e)}>
                      <div className="side-menu__icon"><i className="fa-light fa-money-bill-transfer"></i></div>
                      <span className="sidebar__menu-label">Gestão de Saques</span>
                    </a>
                  </li>
                </>
              )}

              <li className="slide">
                <a href="#logout" className="sidebar__menu-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  <div className="side-menu__icon"><i className="icon-door-open"></i></div>
                  <span className="sidebar__menu-label">Sair</span>
                </a>
              </li>

            </ul>
            <div className="sidebar-right" id="sidebar-right"></div>
          </nav>
        </div>
      </div>
      
      <div className="app__offcanvas-overlay" onClick={closeSidebarOverlay}></div>

      <div className="page__body-wrapper">
        {/* HEADER EXATAMENTE COMO NO PROJETO BASE */}
        <div className="app__header__area">
          <div className="app__header-inner">
            <div className="app__header-left">
              <div className="">
                <a id="sidebar__active" className="app__header-toggle" href="#toggle" onClick={toggleSidebar}>
                  <div className="bar-icon-2">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </a>
              </div>
            </div>
            <div className="app__header-right">
              <div className="app__herader-input p-relative">
              </div>
              <div className="app__header-action">
                <div className="header-toggle-theme" id="theme-toggle-header" title="Alternar Tema">
                  <i className="fa-light fa-moon dark-icon"></i>
                  <i className="fa-light fa-sun-bright light-icon" style={{ display: 'none' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="body__overlay"></div>

        <div className="app__slide-wrapper">
          {renderPage()}
        </div>

        <footer className="footer">
          <div className="row">
            <div className="col-xl-12">
              <div className="card__footer d-flex justify-content-center">
                <p className="text-center">
                  Copyright © <span>2024</span> <span className="text-black">Inovaloto.</span> Todos os direitos reservados
                  <br />
                  <strong>Powered by Zaya Software</strong>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
