import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Dashboard({ user, onNavigate }) {
  const [stats, setStats] = useState({
    totalBilhetes: 0,
    valTotalApostado: 0,
    valTotalPremiacao: 0,
    valTotalComissoes: 0,
    saldoApostadores: 0,
    saldoVendedores: 0,
    saldoLiquido: 0,
    formatted: {
      valTotalApostado: 'R$ 0,00',
      valTotalPremiacao: 'R$ 0,00',
      valTotalComissoes: 'R$ 0,00',
      saldoVendedores: 'R$ 0,00',
      saldoApostadores: 'R$ 0,00',
      saldoLiquido: 'R$ 0,00',
    }
  });

  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  // States for Offcanvas lists
  const [loadingVendedores, setLoadingVendedores] = useState(false);
  const [creditosVendedores, setCreditosVendedores] = useState([]);

  const [loadingApostadores, setLoadingApostadores] = useState(false);
  const [creditosApostadores, setCreditosApostadores] = useState([]);

  const [loadingBilhetes, setLoadingBilhetes] = useState(false);
  const [bilhetesData, setBilhetesData] = useState([]);

  const [loadingExtratoBanca, setLoadingExtratoBanca] = useState(false);
  const [extratoBancaData, setExtratoBancaData] = useState({ apostas: [], comissoes: [] });

  const [loadingExtratoVendedor, setLoadingExtratoVendedor] = useState(false);
  const [extratoVendedorData, setExtratoVendedorData] = useState([]);
  const [searchVendedor, setSearchVendedor] = useState('');

  const loadSummaryData = async (dateRange = dateRangeFilter) => {
    setRefreshing(true);
    try {
      const data = await api.getDashboard('summary', dateRange);
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  };

  useEffect(() => {
    loadSummaryData();
  }, [dateRangeFilter]);

  const handleRefresh = () => {
    loadSummaryData(dateRangeFilter);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    let range = '';
    if (startDate) {
      range = startDate;
      if (endDate && endDate !== startDate) {
        range = `${startDate} até ${endDate}`;
      }
    }
    setDateRangeFilter(range);
  };

  const loadCreditosVendedores = async () => {
    setLoadingVendedores(true);
    try {
      const data = await api.getDashboard('creditosVendedores', dateRangeFilter);
      if (data) setCreditosVendedores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVendedores(false);
    }
  };

  const loadCreditosApostadores = async () => {
    setLoadingApostadores(true);
    try {
      const data = await api.getDashboard('creditosApostadores', dateRangeFilter);
      if (data) setCreditosApostadores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApostadores(false);
    }
  };

  const loadBilhetesData = async () => {
    setLoadingBilhetes(true);
    try {
      const data = await api.getDashboard('bilhetes', dateRangeFilter);
      if (data) setBilhetesData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBilhetes(false);
    }
  };

  const loadExtratoBanca = async () => {
    setLoadingExtratoBanca(true);
    try {
      const data = await api.getDashboard('extratoBanca', dateRangeFilter);
      if (data) setExtratoBancaData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExtratoBanca(false);
    }
  };

  const loadExtratoVendedor = async () => {
    setLoadingExtratoVendedor(true);
    try {
      const data = await api.getDashboard('extratoVendedor', dateRangeFilter);
      if (data) setExtratoVendedorData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExtratoVendedor(false);
    }
  };

  const getIconUrl = (iconPath) => {
    if (!iconPath) return '/assets/images/logo/icon.png';
    if (iconPath.startsWith('http') || iconPath.startsWith('/')) return iconPath;
    return `/assets/images/logo/${iconPath}`;
  };

  const filteredSellers = extratoVendedorData.filter(item =>
    item.vendedor_name.toLowerCase().includes(searchVendedor.toLowerCase())
  );

  return (
    <>
      <style>{`
        .glass {
            background: rgba(25, 25, 30, 0.45);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            border-left: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        html[bd-theme="bd-theme-light"] .glass {
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            border-top: 1px solid rgba(255, 255, 255, 0.8);
            border-left: 1px solid rgba(255, 255, 255, 0.8);
        }

        .glass:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.12);
        }

        html[bd-theme="bd-theme-light"] .glass:hover {
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .glass2 {
            padding: 15px !important;
            background: rgba(20, 20, 25, 0.5);
            border-radius: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            margin-bottom: 0 !important;
            transition: all 0.3s ease;
        }

        html[bd-theme="bd-theme-light"] .glass2 {
            background: rgba(255, 255, 255, 0.45);
            border: 1px solid rgba(0, 0, 0, 0.03);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
        }

        .glass2:hover {
            background: rgba(30, 30, 40, 0.55);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transform: scale(1.02);
        }

        .mini-card-icon {
            transition: all 0.3s ease;
        }

        .glass2:hover .mini-card-icon,
        .glass:hover .mini-card-icon {
            transform: scale(1.1) rotate(5deg);
        }

        .mini-card-icon.icon-success {
            background: rgba(13, 209, 39, 0.219);
            color: rgb(55, 238, 79);
            padding: 10px;
            font-size: 18px;
            border-radius: 5px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
        }

        .mini-card-icon.icon-color-info {
            background: rgba(13, 137, 209, 0.219);
            color: rgb(48, 121, 190);
            padding: 10px;
            font-size: 18px;
            border-radius: 5px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
        }

        .mini-card-icon.icon-warning {
            background: rgba(255, 238, 0, 0.267);
            color: rgb(240, 199, 66);
            padding: 10px;
            font-size: 18px;
            border-radius: 5px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            font-weight: 800 !important;
        }

        .mini-card-icon.icon-danger {
            background: rgba(199, 18, 18, 0.171);
            color: rgb(226, 82, 82);
            padding: 10px;
            font-size: 18px;
            border-radius: 5px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            font-weight: 800 !important;
        }

        .mini-card-icon.icon-light {
            background: rgba(112, 112, 112, 0.171);
            color: rgb(170, 170, 170);
            padding: 10px;
            font-size: 18px;
            border-radius: 5px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            font-weight: 800 !important;
        }

        .card-success {
            background: rgba(13, 209, 39, 0.219);
            padding: 13px !important;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgb(48, 190, 67);
            color: rgb(55, 238, 79) !important;
        }

        .card-danger {
            background: rgba(209, 13, 13, 0.219);
            padding: 13px !important;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgb(190, 48, 48);
            color: rgb(238, 55, 55) !important;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spinning {
            animation: spin 1s linear infinite;
            display: inline-block;
        }

        /* Dashboard Placeholder Custom Styles */
        .refresh-text.placeholder {
            background-color: rgba(180, 180, 180, 0.3) !important;
            border-radius: 4px;
            min-height: 1.2em; /* Ensure it has height even if empty */
            display: inline-block;
            cursor: wait;
            border: none !important;
        }
        
        html[bd-theme="bd-theme-light"] .refresh-text.placeholder {
            background-color: rgba(0, 0, 0, 0.1) !important;
        }

        /* Essential: Hide the text while placeholder is active */
        .placeholder-glow .refresh-text,
        .placeholder-glow .text-success, 
        .placeholder-glow .text-danger,
        .placeholder-glow .text-light,
        .placeholder-glow.text-success,
        .placeholder-glow.text-danger {
            color: transparent !important;
            border-color: transparent !important;
        }

        /* Offcanvas premium dark styling by default */
        .offcanvas {
            background: rgba(22, 22, 28, 0.95) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: #d1d5db !important;
            border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .offcanvas-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .offcanvas-title {
            color: #ffffff !important;
        }
        .offcanvas .btn-close {
            filter: invert(1) grayscale(1) brightness(2) !important;
        }
        .offcanvas .list-group-item {
            background: rgba(30, 30, 38, 0.4) !important;
            border-color: rgba(255, 255, 255, 0.05) !important;
            color: #d1d5db !important;
            transition: all 0.2s ease;
        }
        .offcanvas .list-group-item:hover {
            background: rgba(45, 45, 55, 0.6) !important;
        }
        .offcanvas .text-muted {
            color: #9ca3af !important;
        }
        .offcanvas .card.lottery-card {
            background-color: rgba(30, 30, 38, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            color: #d1d5db !important;
        }
        .offcanvas .card.lottery-card .card-header {
            background-color: rgba(0, 0, 0, 0.2) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        /* Light Theme Overrides */
        html[bd-theme="bd-theme-light"] .offcanvas {
            background: #ffffff !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            color: #334155 !important;
            border-left: 1px solid #e2e8f0 !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas-header {
            border-bottom: 1px solid #e2e8f0 !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas-title {
            color: #1e293b !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas .btn-close {
            filter: none !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas .list-group-item {
            background: #ffffff !important;
            border-color: #f1f5f9 !important;
            color: #334155 !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas .list-group-item:hover {
            background: #f8fafc !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas .text-muted {
            color: #64748b !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas .card.lottery-card {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #334155 !important;
        }
        html[bd-theme="bd-theme-light"] .offcanvas .card.lottery-card .card-header {
            background-color: #f1f5f9 !important;
            border-bottom: 1px solid #e2e8f0 !important;
        }
      `}</style>

      {/* Row g-20: Filters Trigger */}
      <div className="row g-20">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            <a
              href="javascript:void(0)"
              data-bs-toggle="offcanvas"
              data-bs-target="#filtrosOffcanva"
              aria-controls="filtrosOffcanva"
              className="p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center gap-3">
                <i className="icon-filter text-warning fs-5"></i>
                <span className="theme-text-color ms-3 mt-1">Filtros</span>
              </div>
              <i className="icon-chevron-right text-muted"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Row g-20 mt-4: Main Summary Card */}
      <div className="row g-20 mt-4">
        <div className="col-md-12">
          <div className="card__wrapper glass">
            <div className="text-center">
              <div className="card__title-wrap">
                <h6 className="text-muted mb-10">Saldo da Banca</h6>
                <h4
                  id="valSaldoBanca"
                  className={`card__title refresh-field d-flex align-items-center gap-2 justify-content-center ${
                    refreshing ? 'placeholder-glow' : ''
                  } ${stats.saldoLiquido > 0 ? 'text-success' : 'text-danger'}`}
                >
                  <i className="icon-wallet"></i>
                  <span className={`refresh-text ${refreshing ? 'placeholder col-4' : ''}`}>
                    {stats.formatted.saldoLiquido}
                  </span>
                  <button
                    className="btn btn-sm text-primary p-0"
                    type="button"
                    title="Atualizar dados"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <i className={`icon-rotate-right fs-6 ${refreshing ? 'spinning' : ''}`}></i>
                  </button>
                </h4>
                <div className="mt-2">
                  <small className="mt-3">
                    {dateRangeFilter ? dateRangeFilter : 'Hoje'}
                  </small>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              {/* Sales Card */}
              <div className="col-md-6">
                <div className="card__wrapper glass2">
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className="mini-card-icon icon-color-info">
                      <i className="icon-cash-register"></i>
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Vendas</small>
                        <h6 className={`text-light refresh-field ${refreshing ? 'placeholder-glow' : ''}`} id="valVendas">
                          <span className={`refresh-text ${refreshing ? 'placeholder col-8' : ''}`}>
                            {stats.formatted.valTotalApostado}
                          </span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commissions Card */}
              <div className="col-md-6 mt-4 mt-sm-0">
                <div className="card__wrapper glass2">
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className="mini-card-icon icon-warning">
                      <i className="icon-money-bills"></i>
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Comissões</small>
                        <h6 className={`text-danger refresh-field ${refreshing ? 'placeholder-glow' : ''}`} id="valComissoes">
                          <span className={`refresh-text ${refreshing ? 'placeholder col-8' : ''}`}>
                            {stats.formatted.valTotalComissoes}
                          </span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prizes Card */}
              <div className="col-md-6 mt-4 mt-sm-2">
                <div className="card__wrapper glass2">
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className="mini-card-icon icon-warning">
                      <i className="icon-trophy"></i>
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Premiações</small>
                        <h6 className={`text-danger refresh-field ${refreshing ? 'placeholder-glow' : ''}`} id="valPremiacoes">
                          <span className={`refresh-text ${refreshing ? 'placeholder col-8' : ''}`}>
                            {stats.formatted.valTotalPremiacao}
                          </span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Balance Card */}
              <div className="col-md-6 mt-4 mt-sm-2">
                <div
                  className={`card__wrapper glass2 ${
                    stats.saldoLiquido <= 0 ? 'card-danger' : 'card-success'
                  }`}
                >
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className={`mini-card-icon ${stats.saldoLiquido <= 0 ? 'icon-danger' : 'icon-success'}`}>
                      {stats.saldoLiquido <= 0 ? (
                        <i className="icon-arrow-trend-down"></i>
                      ) : (
                        <i className="icon-arrow-trend-up"></i>
                      )}
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Saldo Líquido</small>
                        <h6
                          id="valSaldoLiquido"
                          className={`refresh-field ${refreshing ? 'placeholder-glow' : ''} ${
                            stats.saldoLiquido <= 0 ? 'text-danger' : 'text-success'
                          }`}
                        >
                          <span className={`refresh-text ${refreshing ? 'placeholder col-8' : ''}`}>
                            {stats.formatted.saldoLiquido}
                          </span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row g-20: Seller & Player Credits */}
      <div className="row g-20 mt-4">
        {/* Seller Credits */}
        <div className="col-md-6 mt-4 mt-sm-2">
          <div
            className="card__wrapper glass cursor-pointer"
            style={{ cursor: 'pointer' }}
            data-bs-toggle="offcanvas"
            data-bs-target="#creditosVendedores"
            aria-controls="creditosVendedores"
            onClick={loadCreditosVendedores}
          >
            <span className="mini-card-icon icon-color-info">
              <i className="icon-user"></i>
            </span>
            <div className="text-start mt-2">
              <div>
                <small className="text-muted mb-10">Créditos Vendedores</small>
                <h6 className={`text-light refresh-field ${refreshing ? 'placeholder-glow' : ''}`} id="valCreditosVendedores">
                  <span className={`refresh-text ${refreshing ? 'placeholder col-8' : ''}`}>
                    {stats.formatted.saldoVendedores}
                  </span>
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Player Credits */}
        <div className="col-md-6 mt-4 mt-sm-2">
          <div
            className="card__wrapper glass cursor-pointer"
            style={{ cursor: 'pointer' }}
            data-bs-toggle="offcanvas"
            data-bs-target="#creditosApostadores"
            aria-controls="creditosApostadores"
            onClick={loadCreditosApostadores}
          >
            <span className="mini-card-icon icon-color-info">
              <i className="icon-user-group-simple"></i>
            </span>
            <div className="text-start mt-2">
              <div>
                <small className="text-muted mb-10">Créditos Apostadores</small>
                <h6 className={`text-light refresh-field ${refreshing ? 'placeholder-glow' : ''}`} id="valCreditosApostadores">
                  <span className={`refresh-text ${refreshing ? 'placeholder col-8' : ''}`}>
                    {stats.formatted.saldoApostadores}
                  </span>
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rows (Total Bilhetes, Extrato Banca, Extrato Vendedores) */}
      <div className="row g-20 mt-3">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            <a
              href="javascript:void(0)"
              data-bs-toggle="offcanvas"
              data-bs-target="#bilhetes"
              aria-controls="bilhetes"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between glass"
              onClick={loadBilhetesData}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="mini-card-icon icon-light">
                  <i className="icon-file-lines"></i>
                </span>
                <div className="ms-3">
                  <span className="theme-text-color mt-1">Total de Bilhetes</span>
                  <div className={`text-muted refresh-field ${refreshing ? 'placeholder-glow' : ''}`} id="valTotalBilhetes">
                    <span className={`refresh-text ${refreshing ? 'placeholder col-3' : ''}`}>
                      {stats.totalBilhetes}
                    </span>
                  </div>
                </div>
              </div>
              <i className="icon-chevron-right text-muted me-3"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="row g-20 mt-3">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            <a
              href="javascript:void(0)"
              data-bs-toggle="offcanvas"
              data-bs-target="#extratoBanca"
              aria-controls="extratoBanca"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between glass"
              onClick={loadExtratoBanca}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="mini-card-icon icon-light">
                  <i className="icon-file-lines"></i>
                </span>
                <div className="ms-3">
                  <span className="theme-text-color mt-1">Extrato da Banca</span>
                </div>
              </div>
              <i className="icon-chevron-right text-muted me-3"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="row g-20 mt-3">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            <a
              href="javascript:void(0)"
              data-bs-toggle="offcanvas"
              data-bs-target="#extratoVendedor"
              aria-controls="extratoVendedor"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between glass"
              onClick={loadExtratoVendedor}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="mini-card-icon icon-light">
                  <i className="icon-user"></i>
                </span>
                <div className="ms-3">
                  <span className="theme-text-color mt-1">Extrato dos Vendedores</span>
                </div>
              </div>
              <i className="icon-chevron-right text-muted me-3"></i>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================
          OFFCANVAS ELEMENTS
          ======================================================== */}

      {/* 1. Date Filters Offcanvas */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="filtrosOffcanva" aria-labelledby="filtrosOffcanvaLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title theme-text-color" id="filtrosOffcanvaLabel">Filtrar Resultados</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div>
            <form onSubmit={handleFilterSubmit}>
              <div className="row">
                <div className="col-md-12 mt-2">
                  <div className="mb-3">
                    <label className="form-label text-muted">Data Inicial</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Data Final (Opcional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>
              <button className="btn btn-success w-100 mb-2 mt-3" type="submit" data-bs-dismiss="offcanvas">
                Filtrar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Seller Credits Offcanvas */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="creditosVendedores" aria-labelledby="creditosVendedoresLabel" style={{ width: '600px' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title theme-text-color" id="creditosVendedoresLabel">Saldo dos Vendedores</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {loadingVendedores ? (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 text-muted">Carregando dados...</p>
            </div>
          ) : creditosVendedores.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              Nenhum dado para ser mostrado
            </div>
          ) : (
            <div className="list-group shadow-sm rounded-3 overflow-hidden mt-3 border-0">
              {creditosVendedores.map((item, idx) => (
                <a key={idx} href="javascript:void(0)" className="p-3 mt-1 border-0 border-t-2 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <i className="icon-user text-primary fs-5"></i>
                    <span className="theme-text-color ms-3 mt-1">{item.name}</span>
                  </div>
                  <span className="text-muted">{item.formatted_saldo}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Player Credits Offcanvas */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="creditosApostadaores" aria-labelledby="creditosApostadaoresLabel" style={{ width: '600px' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title theme-text-color" id="creditosApostadaoresLabel">Saldo dos Apostadores</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {loadingApostadores ? (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 text-muted">Carregando dados...</p>
            </div>
          ) : creditosApostadores.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              Nenhum dado para ser mostrado
            </div>
          ) : (
            <div className="list-group shadow-sm rounded-3 overflow-hidden mt-3 border-0">
              {creditosApostadores.map((item, idx) => (
                <a key={idx} href="javascript:void(0)" className="p-3 mt-1 border-0 border-t-2 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <i className="icon-user text-light fs-5"></i>
                    <span className="theme-text-color ms-3 mt-1">{item.name}</span>
                  </div>
                  <span className="text-muted">{item.formatted_saldo}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Tickets (Bilhetes) Offcanvas */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="bilhetes" aria-labelledby="bilhetesLabel" style={{ width: '600px' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title theme-text-color" id="bilhetesLabel">Bilhetes</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {loadingBilhetes ? (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 text-muted">Carregando dados...</p>
            </div>
          ) : bilhetesData.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              Nenhum dado para ser mostrado
            </div>
          ) : (
            <div className="list-group shadow-sm rounded-3 overflow-hidden mt-3 border-0">
              {bilhetesData.map((item, idx) => (
                <a key={idx} href="javascript:void(0)" className="p-3 mt-1 border-0 border-t-2 list-group-item list-group-item-action">
                  <div className="text-center">
                    <img src={getIconUrl(item.modalidade_icone)} alt={item.modalidade_nome} width="40" height="40" style={{ borderRadius: '8px' }} />
                    <span className="theme-text-color ms-3 mt-1">{item.modalidade_nome}</span>
                  </div>
                  <hr className="mt-3 text-muted" />
                  <div className="row mt-3">
                    <div className="col-md-12 text-center">
                      <h6 className="text-muted">Total de Bilhetes</h6>
                      <h5 className="mt-2 theme-text-color">{item.total_bilhetes}</h5>
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-md-4 text-center">
                      <h6 className="text-muted">Normais</h6>
                      <h5 className="mt-2 theme-text-color">{item.bilhetes_normais}</h5>
                    </div>
                    <div className="col-md-4 text-center">
                      <h6 className="text-muted">Surpresinha</h6>
                      <h5 className="mt-2 theme-text-color">{item.bilhetes_surpresinha}</h5>
                    </div>
                    <div className="col-md-4 text-center">
                      <h6 className="text-muted">Importados</h6>
                      <h5 className="mt-2 theme-text-color">{item.bilhetes_importados}</h5>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Bank Statement (Extrato Banca) Offcanvas */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="extratoBanca" aria-labelledby="extratoBancaLabel" style={{ width: '600px' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title theme-text-color" id="extratoBancaLabel">Extrato</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {loadingExtratoBanca ? (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 text-muted">Carregando dados...</p>
            </div>
          ) : (extratoBancaData.apostas.length === 0 && extratoBancaData.comissoes.length === 0) ? (
            <div className="text-center mt-5 text-muted">
              Nenhum dado para ser mostrado
            </div>
          ) : (
            <div className="list-group shadow-sm rounded-3 overflow-hidden mt-3 border-0">
              {extratoBancaData.apostas.map((item, idx) => (
                <a key={`aposta-${idx}`} href="javascript:void(0)" className="p-3 mt-1 border-0 border-t-2 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <img src={getIconUrl(item.modalidade_icone)} alt={item.modalidade_nome} width="30" height="30" style={{ borderRadius: '6px' }} />
                      <span className="theme-text-color ms-3 mt-1">{item.modalidade_nome}</span>
                    </div>
                  </div>
                  <span className="text-success">+ {item.formatted_val_apostado}</span>
                </a>
              ))}
              {extratoBancaData.comissoes.map((item, idx) => (
                <a key={`comissao-${idx}`} href="javascript:void(0)" className="p-3 mt-1 border-0 border-t-2 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <i className="icon-user text-light fs-5 ms-1"></i>
                      <span className="theme-text-color ms-4 mt-1">Comissão - {item.vendedor_name}</span>
                    </div>
                  </div>
                  <span className="text-danger">- {item.formatted_comissao}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Sellers Statement (Extrato Vendedores) Offcanvas */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="extratoVendedor" aria-labelledby="extratoVendedorLabel" style={{ width: '600px' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title theme-text-color" id="extratoVendedorLabel">Extrato dos Vendedores</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRight: 'none' }}>
                <i className="icon-magnifying-glass text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Pesquisar vendedor..."
                value={searchVendedor}
                onChange={e => setSearchVendedor(e.target.value)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderLeft: 'none', color: '#fff' }}
              />
              <button className="btn btn-secondary" type="button" onClick={() => setSearchVendedor('')} title="Resetar">
                <i className="icon-rotate-right"></i> <span className="d-none d-sm-inline">Limpar</span>
              </button>
            </div>
          </div>

          {loadingExtratoVendedor ? (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2 text-muted">Carregando dados...</p>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              Nenhum vendedor encontrado.
            </div>
          ) : (
            <div id="contentExtratoVendedor">
              {filteredSellers.map((item, idx) => (
                <div key={idx} className="card lottery-card mb-3 theme-bg-color" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="card-header d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 15px' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div>
                        <i className="icon-user text-primary fs-5"></i>
                        <span className="theme-text-color ms-2">{item.vendedor_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-body text-center d-flex flex-column justify-content-start theme-text-color" style={{ padding: '15px', boxShadow: 'none' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><i className="icon-dollar-sign text-success"></i><span className="ms-2">Vendas</span></div>
                      <div className="text-success">R$ {item.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><i className="icon-dollar-sign text-danger"></i><span className="ms-2">Comissão</span></div>
                      <div className="text-danger">R$ {item.comissao_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><i className="icon-dollar-sign text-danger"></i><span className="ms-2">Comissão Bônus</span></div>
                      <div className="text-danger">R$ {item.comissao_bonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><i className="icon-dollar-sign text-danger"></i><span className="ms-2">Premiações</span></div>
                      <div className="text-danger">R$ {item.premiacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <hr className="text-muted my-2" />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><i className="icon-equals"></i><span className="ms-2">Total (Venda - Comissão)</span></div>
                      <div className={item.t1 < 0 ? 'text-danger' : 'text-success'}>
                        R$ {item.t1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><i className="icon-equals"></i><span className="ms-2">Total (Venda - Com. - Bônus)</span></div>
                      <div className={item.t2 < 0 ? 'text-danger' : 'text-success'}>
                        R$ {item.t2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><i className="icon-equals"></i><span className="ms-2">Total (Venda - Com. - Bônus - Prem.)</span></div>
                      <div className={item.t3 < 0 ? 'text-danger' : 'text-success'}>
                        R$ {item.t3.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <hr className="text-muted my-2" />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div><i className="icon-equals"></i><span className="ms-2"><b>Saldo</b></span></div>
                      <div className={item.saldo < 0 ? 'text-danger' : 'text-success'}>
                        <b>R$ {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="text-muted small"><i className="icon-file-lines me-1"></i>Normais</div>
                      <div className="theme-text-color small">{item.bilhetes_count}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="text-muted small"><i className="icon-file-lines me-1"></i>Surpresinha</div>
                      <div className="theme-text-color small">{item.surpresinha_count}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="text-muted small"><i className="icon-file-lines me-1"></i>Importados</div>
                      <div className="theme-text-color small">{item.imported_count}</div>
                    </div>
                    <div className="mt-2">
                      <button
                        className="btn btn-primary btn-sm w-100"
                        data-bs-dismiss="offcanvas"
                        onClick={() => onNavigate('wallet')}
                      >
                        Fechamento de Caixa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
