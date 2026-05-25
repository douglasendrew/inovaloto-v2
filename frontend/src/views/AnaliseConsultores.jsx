import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

export default function AnaliseConsultores({ onNavigate }) {
  const [modalidades, setModalidades] = useState([]);
  const [consultores, setConsultores] = useState([]);
  const [resumo, setResumo] = useState({ total_vendido: 0, total_premiado: 0, total_comissao: 0, qtd_lucro: 0, qtd_prejuizo: 0 });
  const [saldoLiquido, setSaldoLiquido] = useState(0);

  // Pagination & Loading states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters State
  const [dateRange, setDateRange] = useState('');
  const [ordem, setOrdem] = useState('');
  const [selectedModId, setSelectedModId] = useState('');

  // Local temp filter states for offcanvas form
  const [tempDateRange, setTempDateRange] = useState('');
  const [tempOrdem, setTempOrdem] = useState('');
  const [tempModId, setTempModId] = useState('');

  // Consultant details state
  const [expandedUuids, setExpandedUuids] = useState([]);
  const [detailsData, setDetailsData] = useState({}); // { [uuid]: data }
  const [loadingDetails, setLoadingDetails] = useState({}); // { [uuid]: boolean }

  // Expanded nested modalities & dezenas view states
  const [expandedModDezenas, setExpandedModDezenas] = useState({}); // { [uuid-modIdx]: boolean }
  const [visibleWinnersCount, setVisibleWinnersCount] = useState({}); // { [uuid]: int }
  const [visibleLosersCount, setVisibleLosersCount] = useState({}); // { [uuid]: int }

  const dateInputRef = useRef(null);
  const flatpickrInstance = useRef(null);

  // Format Helper
  const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  useEffect(() => {
    // Set default date range to today's date
    const today = new Date().toISOString().split('T')[0];
    setDateRange(today);
    setTempDateRange(today);
    loadData(today, '', '', 1, false);
  }, []);

  // Initialize Flatpickr when offcanvas is mounted/rendered
  useEffect(() => {
    if (dateInputRef.current && window.flatpickr) {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
      flatpickrInstance.current = window.flatpickr(dateInputRef.current, {
        enableTime: false,
        altInput: true,
        dateFormat: "Y-m-d",
        altFormat: "d/m/Y",
        mode: "range",
        locale: {
          rangeSeparator: " até "
        },
        defaultDate: tempDateRange,
        onChange: (selectedDates, dateStr) => {
          setTempDateRange(dateStr);
        }
      });
    }
    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
    };
  }, [tempDateRange]);

  const loadData = async (dates, sortOrder, modId, pageNum, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await api.getAnaliseConsultores(dates, sortOrder, modId, pageNum);
      if (response && response.success) {
        setModalidades(response.modalidades || []);
        setResumo(response.resumo || { total_vendido: 0, total_premiado: 0, total_comissao: 0, qtd_lucro: 0, qtd_prejuizo: 0 });
        setSaldoLiquido(response.saldoLiquido || 0);
        setCurrentPage(response.analise?.current_page || 1);
        setLastPage(response.analise?.last_page || 1);

        if (append) {
          setConsultores(prev => [...prev, ...(response.analise?.data || [])]);
        } else {
          setConsultores(response.analise?.data || []);
          setExpandedUuids([]); // Reset expanded ones on full filter
        }
      }
    } catch (e) {
      console.error('Error loading Analise de Consultores', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setDateRange(tempDateRange);
    setOrdem(tempOrdem);
    setSelectedModId(tempModId);

    const offcanvasEl = document.getElementById('filtrosOffcanvas');
    if (offcanvasEl && window.bootstrap) {
      const offcanvasInstance = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    }

    loadData(tempDateRange, tempOrdem, tempModId, 1, false);
  };

  const handleClearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setTempDateRange(today);
    setTempOrdem('');
    setTempModId('');
    setDateRange(today);
    setOrdem('');
    setSelectedModId('');

    const offcanvasEl = document.getElementById('filtrosOffcanvas');
    if (offcanvasEl && window.bootstrap) {
      const offcanvasInstance = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    }

    loadData(today, '', '', 1, false);
  };

  const handleLoadMore = () => {
    if (currentPage < lastPage && !loadingMore) {
      loadData(dateRange, ordem, selectedModId, currentPage + 1, true);
    }
  };

  const toggleDetails = async (uuid) => {
    if (expandedUuids.includes(uuid)) {
      setExpandedUuids(prev => prev.filter(v => v !== uuid));
      return;
    }

    setExpandedUuids(prev => [...prev, uuid]);

    if (!detailsData[uuid]) {
      setLoadingDetails(prev => ({ ...prev, [uuid]: true }));
      try {
        const response = await api.getAnaliseConsultorDetails(uuid, dateRange, selectedModId);
        if (response) {
          setDetailsData(prev => ({ ...prev, [uuid]: response }));
          setVisibleWinnersCount(prev => ({ ...prev, [uuid]: 5 }));
          setVisibleLosersCount(prev => ({ ...prev, [uuid]: 5 }));
        }
      } catch (err) {
        console.error('Error fetching consultant details', err);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [uuid]: false }));
      }
    }
  };

  const toggleDezenas = (uuid, idx) => {
    const key = `${uuid}-${idx}`;
    setExpandedModDezenas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <style>{`
        .card-glass {
          background: linear-gradient(135deg, rgba(30, 30, 45, 0.5) 0%, rgba(18, 18, 28, 0.7) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          padding: 22px;
          backdrop-filter: blur(12px);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          color: #f8fafc !important;
        }
        .card-glass:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .card-glass-mini {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 14px 18px;
          transition: background 0.2s ease;
          color: #f8fafc !important;
        }
        .card-glass-mini:hover {
          background: rgba(255, 255, 255, 0.035);
        }
        .text-muted {
          color: #a1a1b5 !important;
        }
        .theme-text-color {
          color: #ffffff !important;
        }
        .card-success {
          border-left: 4px solid #10b981 !important;
        }
        .card-danger {
          border-left: 4px solid #f43f5e !important;
        }
        .mini-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .icon-bg-info {
          background: rgba(6, 182, 212, 0.12);
          color: #22d3ee;
        }
        .icon-bg-warning {
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
        }
        .icon-bg-success {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
        }
        .icon-bg-danger {
          background: rgba(244, 63, 94, 0.12);
          color: #f87171;
        }
        .offcanvas-dark-custom {
          background-color: #12121e !important;
          color: #e2e8f0 !important;
          border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
        }
        .offcanvas-dark-custom .btn-close {
          filter: invert(1) grayscale(1) brightness(2);
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .offcanvas-dark-custom .btn-close:hover {
          opacity: 1;
        }
        .offcanvas-dark-custom .form-control, .offcanvas-dark-custom .form-select {
          background-color: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #f8fafc !important;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .offcanvas-dark-custom .form-control:focus, .offcanvas-dark-custom .form-select:focus {
          border-color: #6c5ffc !important;
          box-shadow: 0 0 0 3px rgba(108, 95, 252, 0.2) !important;
        }
        .consultant-header {
          transition: background 0.25s;
          border-radius: 10px;
          padding: 10px;
        }
        .consultant-header:hover {
          background: rgba(255, 255, 255, 0.025);
        }
        .number-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          background: rgba(0,0,0,0.1);
          border-radius: 6px;
          margin-bottom: 4px;
          transition: background 0.2s;
        }
        .number-item:hover {
          background: rgba(255,255,255,0.02);
        }
        .badge-premium-success {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #34d399 !important;
          border: 1px solid rgba(16, 185, 129, 0.25);
          font-weight: 600;
        }
        .badge-premium-danger {
          background: rgba(244, 63, 94, 0.15) !important;
          color: #f87171 !important;
          border: 1px solid rgba(244, 63, 94, 0.25);
          font-weight: 600;
        }
        .badge-premium-info {
          background: rgba(6, 182, 212, 0.15) !important;
          color: #22d3ee !important;
          border: 1px solid rgba(6, 182, 212, 0.25);
          font-weight: 600;
        }
        .badge-premium-secondary {
          background: rgba(255, 255, 255, 0.06) !important;
          color: #cbd5e1 !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }
        .filter-btn-trigger {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
          transition: all 0.2s ease;
        }
        .filter-btn-trigger:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .btn-show-more {
          color: #6c5ffc !important;
          font-weight: 600;
          font-size: 11px;
          text-decoration: none;
          padding: 6px 12px;
          background: rgba(108, 95, 252, 0.08);
          border-radius: 6px;
          border: 1px solid rgba(108, 95, 252, 0.15);
          transition: all 0.2s;
        }
        .btn-show-more:hover {
          background: rgba(108, 95, 252, 0.15);
          color: #8c7ffc !important;
        }
      `}</style>

      {/* Page Header */}
      <div className="row g-20 align-items-center">
        <div className="col-md-12">
          <div className="card__wrapper" style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="card__icon me-3" style={{ background: 'rgba(108, 95, 252, 0.1)', border: '1px solid rgba(108, 95, 252, 0.2)', borderRadius: '10px' }}>
                  <span style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="icon-chart-line text-primary" style={{ fontSize: '22px' }}></i>
                  </span>
                </div>
                <div>
                  <h2 className="card__sub-title mb-0" style={{ fontSize: '18px', fontWeight: '700' }}>Análise dos Consultores</h2>
                  <small className="text-muted" style={{ fontSize: '12px' }}>Desempenho, faturamento e relatórios consolidados por vendedor</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters trigger row */}
      <div className="row g-20 mt-3">
        <div className="col-md-12">
          <div className="shadow-sm rounded-3 overflow-hidden border-0">
            <button
              onClick={() => {
                setTempDateRange(dateRange);
                setTempOrdem(ordem);
                setTempModId(selectedModId);
              }}
              data-bs-toggle="offcanvas"
              data-bs-target="#filtrosOffcanvas"
              aria-controls="filtrosOffcanvas"
              className="p-3 border-0 w-100 filter-btn-trigger d-flex align-items-center justify-content-between text-start"
              style={{ color: 'inherit', borderRadius: '10px' }}
            >
              <div className="d-flex align-items-center gap-3">
                <i className="icon-filter text-warning fs-5"></i>
                <span className="fw-semibold" style={{ fontSize: '14px' }}>Filtrar Vendedores</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {dateRange && (
                  <span className="badge badge-premium-secondary" style={{ fontSize: '11px' }}>
                    <i className="icon-calendar me-1"></i> {dateRange}
                  </span>
                )}
                {ordem && (
                  <span className="badge badge-premium-info" style={{ fontSize: '11px' }}>
                    {ordem === 'mais_lucrativo' ? 'Mais Lucrativo' : ordem === 'mais_prejuizo' ? 'Mais Prejuízo' : 'Nome'}
                  </span>
                )}
                {selectedModId && (
                  <span className="badge badge-premium-info" style={{ fontSize: '11px' }}>
                    {modalidades.find(m => String(m.id) === String(selectedModId))?.nome || 'Modalidade'}
                  </span>
                )}
                <i className="icon-chevron-right text-muted fs-6"></i>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="card-glass mt-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Consolidado do Período</span>
        </div>

        <div className="row g-3">
          <div className="col-6 col-md-6">
            <div className="card-glass-mini">
              <div className="d-flex align-items-center gap-3">
                <div className="mini-card-icon icon-bg-info">
                  <i className="icon-cash-register"></i>
                </div>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>Vendas</small>
                  <span className="text-light fw-bold fs-5">{formatMoney(resumo.total_vendido)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6">
            <div className="card-glass-mini">
              <div className="d-flex align-items-center gap-3">
                <div className="mini-card-icon icon-bg-info">
                  <i className="icon-money-bills"></i>
                </div>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>Comissões</small>
                  <span className="text-light fw-bold fs-5">{formatMoney(resumo.total_comissao)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6">
            <div className="card-glass-mini">
              <div className="d-flex align-items-center gap-3">
                <div className="mini-card-icon icon-bg-warning">
                  <i className="icon-trophy"></i>
                </div>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>Premiações</small>
                  <span className="text-light fw-bold fs-5">{formatMoney(resumo.total_premiado)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6">
            <div className={`card-glass-mini ${saldoLiquido > 0 ? 'card-success' : saldoLiquido < 0 ? 'card-danger' : ''}`}>
              <div className="d-flex align-items-center gap-3">
                <div className={`mini-card-icon ${saldoLiquido >= 0 ? 'icon-bg-success' : 'icon-bg-danger'}`}>
                  <i className={saldoLiquido >= 0 ? 'icon-arrow-trend-up' : 'icon-arrow-trend-down'}></i>
                </div>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                    {saldoLiquido >= 0 ? 'Lucro Líquido Banca' : 'Prejuízo Líquido Banca'}
                  </small>
                  <span className="text-light fw-bold fs-5">{formatMoney(saldoLiquido)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sellers List */}
      <div className="mt-4">
        <h6 className="mb-3 fw-bold text-light" style={{ fontSize: '14px' }}>Estatísticas Individuais</h6>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3 text-muted">Buscando análise dos consultores...</p>
          </div>
        ) : consultores.length === 0 ? (
          <div className="card-glass text-center py-5 text-muted">
            <i className="icon-folder-open fs-3 mb-2 d-block text-secondary"></i>
            Nenhum consultor registrou apostas no período.
          </div>
        ) : (
          <>
            {consultores.map((item) => {
              const isExpanded = expandedUuids.includes(item.uuid);
              const details = detailsData[item.uuid];
              const isDetailsLoading = loadingDetails[item.uuid];

              return (
                <div key={item.uuid} className="card-glass mb-3">
                  <div
                    className="consultant-header d-flex align-items-center justify-content-between cursor-pointer"
                    onClick={() => toggleDetails(item.uuid)}
                  >
                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                      <div className="mini-card-icon icon-bg-info" style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}>
                        <i className="icon-chevron-down text-primary"></i>
                      </div>
                      <div className="ms-2" style={{ minWidth: 0 }}>
                        <div className="theme-text-color fw-bold text-truncate" style={{ fontSize: '16px' }}>{item.name}</div>
                        <small className="text-muted">{item.qtd_bilhetes} {item.qtd_bilhetes === 1 ? 'bilhete vendido' : 'bilhetes vendidos'}</small>
                      </div>
                    </div>
                    <div className="text-end ms-2" style={{ flexShrink: 0 }}>
                      <span className={`badge p-2 px-3 fs-6 ${item.lucro > 0 ? 'badge-premium-success' : item.lucro < 0 ? 'badge-premium-danger' : 'badge-premium-secondary'}`} style={{ whiteSpace: 'nowrap' }}>
                        {item.lucro > 0 ? <i className="icon-arrow-trend-up me-1"></i> : item.lucro < 0 ? <i className="icon-arrow-trend-down me-1"></i> : <i className="icon-equals me-1"></i>}
                        {formatMoney(item.lucro)}
                      </span>
                      <div><small className="text-muted" style={{ fontSize: '10px' }}>Lucro Líquido</small></div>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="row mt-3 g-2">
                    <div className="col-12 col-md-4">
                      <div className="card-glass-mini py-2">
                        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                          <div className="mini-card-icon icon-bg-info" style={{ flexShrink: 0, width: '36px', height: '36px', fontSize: '14px' }}>
                            <i className="icon-cash-register"></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>Vendas</small>
                            <div className="text-light fw-bold" style={{ fontSize: '13px' }}>{formatMoney(item.total_vendido)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="card-glass-mini py-2">
                        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                          <div className="mini-card-icon icon-bg-warning" style={{ flexShrink: 0, width: '36px', height: '36px', fontSize: '14px' }}>
                            <i className="icon-trophy"></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>Prêmios</small>
                            <div className="text-light fw-bold" style={{ fontSize: '13px' }}>{formatMoney(item.total_premiado)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="card-glass-mini py-2">
                        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                          <div className="mini-card-icon icon-bg-info" style={{ flexShrink: 0, width: '36px', height: '36px', fontSize: '14px' }}>
                            <i className="icon-money-bills"></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>Comissão</small>
                            <div className="text-light fw-bold" style={{ fontSize: '13px' }}>{formatMoney(item.total_comissao)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div className="mt-4 border-top pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {isDetailsLoading ? (
                        <div className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                          <div className="text-muted mt-2" style={{ fontSize: '12px' }}>Carregando detalhes do vendedor...</div>
                        </div>
                      ) : details ? (
                        <div className="row g-3">
                          {/* Modality breakdown table */}
                          <div className="col-md-12">
                            <div className="card-glass-mini" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <div className="table-responsive">
                                <table className="table table-dark table-borderless align-middle mb-0" style={{ background: 'transparent', fontSize: '13px' }}>
                                  <thead>
                                    <tr className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                      <th className="pb-2">Modalidade</th>
                                      <th className="text-center pb-2">Qtd.</th>
                                      <th className="text-center pb-2">Vendas</th>
                                      <th className="text-center pb-2">Prêmios</th>
                                      <th className="text-center pb-2">Comissão</th>
                                      <th className="text-end pb-2">Líq. Banca</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.detalhes_modalidades.map((mod, mIdx) => {
                                      const isModExpanded = expandedModDezenas[`${item.uuid}-${mIdx}`];
                                      return (
                                        <React.Fragment key={mIdx}>
                                          <tr
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                                            onClick={() => toggleDezenas(item.uuid, mIdx)}
                                            className="align-middle"
                                          >
                                            <td className="theme-text-color py-3">
                                              <div className="d-flex align-items-center gap-2">
                                                <i className="icon-chevron-right text-muted" style={{ fontSize: '10px', transform: isModExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}></i>
                                                <img
                                                  src={mod.icone}
                                                  width="22"
                                                  height="22"
                                                  style={{ borderRadius: '4px', objectFit: 'cover' }}
                                                  onError={(e) => { e.target.src = '/assets/images/logo/icon.png'; }}
                                                />
                                                <span className="fw-semibold text-white" style={{ fontSize: '13px' }}>{mod.nome}</span>
                                              </div>
                                            </td>
                                            <td className="text-center">{mod.qtd_vendas}</td>
                                            <td className="text-center">{formatMoney(mod.vendas)}</td>
                                            <td className="text-center">{formatMoney(mod.premios)}</td>
                                            <td className="text-center">{formatMoney(mod.comissoes)}</td>
                                            <td className={`text-end fw-bold ${mod.lucro >= 0 ? 'text-success' : 'text-danger'}`}>
                                              {formatMoney(mod.lucro)}
                                            </td>
                                          </tr>
                                          {isModExpanded && (
                                            <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                                              <td colSpan="6" className="p-0">
                                                <div className="p-3">
                                                  <table className="table table-sm table-dark table-borderless mb-0" style={{ fontSize: '11px', opacity: 0.85 }}>
                                                    <thead>
                                                      <tr className="text-muted" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <th className="pb-1">Dezena</th>
                                                        <th className="text-center pb-1">Qtd.</th>
                                                        <th className="text-center pb-1">Vendas</th>
                                                        <th className="text-center pb-1">Prêmios</th>
                                                        <th className="text-center pb-1">Comissão</th>
                                                        <th className="text-end pb-1">Líq. Banca</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {mod.dezenas.map((d, dIdx) => (
                                                        <tr key={dIdx}>
                                                          <td className="py-2 text-white fw-bold">{d.dezena}</td>
                                                          <td className="text-center py-2">{d.qtd}</td>
                                                          <td className="text-center py-2">{formatMoney(d.vendas)}</td>
                                                          <td className="text-center py-2">{formatMoney(d.premios)}</td>
                                                          <td className="text-center py-2">{formatMoney(d.comissao)}</td>
                                                          <td className={`text-end py-2 fw-semibold ${d.liq_banca >= 0 ? 'text-success' : 'text-danger'}`}>
                                                            {formatMoney(d.liq_banca)}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          {/* Prejuízos list */}
                           <div className="col-6 col-sm-6 mt-1">
                             <div className="card-glass-mini">
                               <div className="d-flex justify-content-between align-items-center mb-3">
                                 <label className="text-danger m-0 fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                   <i className="icon-circle-down me-1"></i> Prejuízos
                                 </label>
                                 <div className="d-flex align-items-center gap-1">
                                   <span className="badge badge-premium-danger" style={{ fontSize: '10px' }}>
                                     {details.count_premios}
                                   </span>
                                 </div>
                               </div>
                               <div className="winners-list">
                                 {details.premios_detalhados.length === 0 ? (
                                   <div className="text-center text-secondary p-3" style={{ fontSize: '11px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>Nenhum prejuízo.</div>
                                 ) : (
                                   <>
                                     {details.premios_detalhados.slice(0, visibleWinnersCount[item.uuid] || 5).map((b, idx) => (
                                       <div key={idx} className="number-item">
                                         <div>
                                           <div className="text-light fw-bold" style={{ fontSize: '11px' }}>
                                             {b.qtd_dezenas} dezenas
                                           </div>
                                           <small className="text-secondary d-block mt-1" style={{ fontSize: '9px' }}>{b.modalidade} • {b.data}</small>
                                         </div>
                                         <span className="text-danger fw-bold" style={{ fontSize: '11px' }}>-{formatMoney(b.valor)}</span>
                                       </div>
                                     ))}

                                     <div className="d-flex justify-content-center gap-2 mt-3">
                                       {details.premios_detalhados.length > (visibleWinnersCount[item.uuid] || 5) && (
                                         <a href="javascript:void(0)" className="btn-show-more"
                                            onClick={() => setVisibleWinnersCount(prev => ({ ...prev, [item.uuid]: (prev[item.uuid] || 5) + 5 }))}>
                                           <i className="icon-plus me-1"></i>
                                         </a>
                                       )}
                                       {visibleWinnersCount[item.uuid] > 5 && (
                                         <a href="javascript:void(0)" className="btn-show-more"
                                            onClick={() => setVisibleWinnersCount(prev => ({ ...prev, [item.uuid]: 5 }))}>
                                           <i className="icon-minus me-1"></i>
                                         </a>
                                       )}
                                     </div>
                                   </>
                                 )}
                               </div>
                             </div>
                           </div>

                           {/* Lucros list */}
                           <div className="col-6 col-sm-6 mt-1">
                             <div className="card-glass-mini">
                               <div className="d-flex justify-content-between align-items-center mb-3">
                                 <label className="text-success m-0 fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                   <i className="icon-circle-up me-1"></i> Lucros
                                 </label>
                                 <div className="d-flex align-items-center gap-1">
                                   <span className="badge badge-premium-success" style={{ fontSize: '10px' }}>
                                     {details.count_vendas}
                                   </span>
                                 </div>
                               </div>
                               <div className="losers-list">
                                 {details.vendas_detalhadas.length === 0 ? (
                                   <div className="text-center text-secondary p-3" style={{ fontSize: '11px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>Nenhum lucro.</div>
                                 ) : (
                                   <>
                                     {details.vendas_detalhadas.slice(0, visibleLosersCount[item.uuid] || 5).map((b, idx) => (
                                       <div key={idx} className="number-item">
                                         <div>
                                           <div className="text-light fw-bold" style={{ fontSize: '11px' }}>
                                             {b.qtd_dezenas} dezenas
                                           </div>
                                           <small className="text-secondary d-block mt-1" style={{ fontSize: '9px' }}>{b.modalidade} • {b.data}</small>
                                         </div>
                                         <span className="text-success fw-bold" style={{ fontSize: '11px' }}>+{formatMoney(b.valor)}</span>
                                       </div>
                                     ))}

                                     <div className="d-flex justify-content-center gap-2 mt-3">
                                       {details.vendas_detalhadas.length > (visibleLosersCount[item.uuid] || 5) && (
                                         <a href="javascript:void(0)" className="btn-show-more"
                                            onClick={() => setVisibleLosersCount(prev => ({ ...prev, [item.uuid]: (prev[item.uuid] || 5) + 5 }))}>
                                           <i className="icon-plus me-1"></i>
                                         </a>
                                       )}
                                       {visibleLosersCount[item.uuid] > 5 && (
                                         <a href="javascript:void(0)" className="btn-show-more"
                                            onClick={() => setVisibleLosersCount(prev => ({ ...prev, [item.uuid]: 5 }))}>
                                           <i className="icon-minus me-1"></i>
                                         </a>
                                       )}
                                     </div>
                                   </>
                                 )}
                               </div>
                             </div>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center text-secondary py-3" style={{ fontSize: '12px' }}>Falha ao carregar relatórios.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {currentPage < lastPage && (
              <div className="text-center mt-4 mb-5">
                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{ borderRadius: '8px', fontWeight: '600' }}
                >
                  {loadingMore ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Carregando...
                    </>
                  ) : (
                    'Carregar Mais Consultores'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Offcanvas */}
      <div className="offcanvas offcanvas-end offcanvas-dark-custom" tabIndex="-1" id="filtrosOffcanvas" aria-labelledby="filtrosOffcanvasLabel">
        <div className="offcanvas-header border-bottom" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h5 className="offcanvas-title fw-bold text-light" id="filtrosOffcanvasLabel">
            <i className="icon-filter me-2 text-warning"></i>Filtrar Consultores
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleApplyFilters}>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label text-muted fw-semibold" style={{ fontSize: '12px' }}>Período do Sorteio</label>
                <input
                  ref={dateInputRef}
                  type="text"
                  className="form-control"
                  placeholder="Selecione as datas"
                  value={tempDateRange}
                  onChange={(e) => setTempDateRange(e.target.value)}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label text-muted fw-semibold" style={{ fontSize: '12px' }}>Classificar Vendedores por</label>
                <select
                  className="form-select"
                  value={tempOrdem}
                  onChange={(e) => setTempOrdem(e.target.value)}
                >
                  <option value="">Ordem Alfabética (Nome)</option>
                  <option value="mais_lucrativo">Mais Lucrativos para Banca</option>
                  <option value="mais_prejuizo">Mais Prejuízos para Banca</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label text-muted fw-semibold" style={{ fontSize: '12px' }}>Modalidade</label>
                <select
                  className="form-select"
                  value={tempModId}
                  onChange={(e) => setTempModId(e.target.value)}
                >
                  <option value="">Todas</option>
                  {modalidades.map((mod) => (
                    <option key={mod.id} value={mod.id}>{mod.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-success w-100 mb-2 mt-5 py-2" style={{ borderRadius: '8px', fontWeight: '600' }}>
              <i className="icon-filter me-2"></i> Aplicar Filtros
            </button>
            <button type="button" onClick={handleClearFilters} className="btn btn-outline-secondary w-100 py-2" style={{ borderRadius: '8px' }}>
              Limpar Filtros
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
