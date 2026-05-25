import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const STYLES = `
  /* ── AnaliseRisco scoped styles ── */
  .ar-card {
    background: linear-gradient(135deg, rgba(30,30,48,0.65) 0%, rgba(15,15,28,0.85) 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    color: #e8eaf6;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }
  .ar-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.3);
    border-color: rgba(255,255,255,0.12);
  }
  .ar-mini {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 16px;
    color: #e8eaf6;
    transition: background 0.18s ease;
    height: 100%;
  }
  .ar-mini:hover { background: rgba(255,255,255,0.05); }
  .ar-mini-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #9ca3c8;
    display: block;
    margin-bottom: 4px;
  }
  .ar-mini-value {
    font-size: 15px;
    font-weight: 700;
    color: #f0f2ff;
  }
  .ar-icon-box {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
  }
  .ar-icon-cyan   { background: rgba(6,182,212,0.14);  color: #22d3ee; }
  .ar-icon-amber  { background: rgba(245,158,11,0.14); color: #fbbf24; }
  .ar-icon-green  { background: rgba(16,185,129,0.14); color: #34d399; }
  .ar-icon-red    { background: rgba(244,63,94,0.14);  color: #f87171; }
  .ar-icon-purple { background: rgba(108,95,252,0.14); color: #a78bfa; }
  .ar-border-l-green { border-left: 4px solid #10b981 !important; }
  .ar-border-l-red   { border-left: 4px solid #f43f5e !important; }

  /* badges */
  .ar-badge-success {
    background: rgba(16,185,129,0.15) !important; color: #34d399 !important;
    border: 1px solid rgba(16,185,129,0.28); font-weight: 600; border-radius: 6px;
  }
  .ar-badge-danger {
    background: rgba(244,63,94,0.15) !important; color: #f87171 !important;
    border: 1px solid rgba(244,63,94,0.28); font-weight: 600; border-radius: 6px;
  }
  .ar-badge-info {
    background: rgba(6,182,212,0.15) !important; color: #22d3ee !important;
    border: 1px solid rgba(6,182,212,0.28); font-weight: 600; border-radius: 6px;
  }
  .ar-badge-neutral {
    background: rgba(255,255,255,0.07) !important; color: #c8ccdf !important;
    border: 1px solid rgba(255,255,255,0.12); font-weight: 600; border-radius: 6px;
  }

  /* filter trigger */
  .ar-filter-trigger {
    background: rgba(255,255,255,0.03) !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 12px;
    color: #e8eaf6 !important;
    transition: all 0.2s ease;
    width: 100%;
  }
  .ar-filter-trigger:hover {
    background: rgba(255,255,255,0.06) !important;
    border-color: rgba(255,255,255,0.12) !important;
  }

  /* offcanvas */
  .ar-offcanvas {
    background-color: #0f0f1c !important;
    border-left: 1px solid rgba(255,255,255,0.08) !important;
    box-shadow: -12px 0 40px rgba(0,0,0,0.55);
    color: #e8eaf6 !important;
  }
  .ar-offcanvas .btn-close {
    filter: invert(1) grayscale(1) brightness(2); opacity: 0.75;
  }
  .ar-offcanvas .btn-close:hover { opacity: 1; }
  .ar-offcanvas .form-label { color: #9ca3c8; font-size: 12px; font-weight: 600; }
  .ar-offcanvas .form-control,
  .ar-offcanvas .form-select {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: #f0f2ff !important; border-radius: 8px; padding: 10px 14px;
  }
  .ar-offcanvas .form-control:focus,
  .ar-offcanvas .form-select:focus {
    border-color: #6c5ffc !important;
    box-shadow: 0 0 0 3px rgba(108,95,252,0.22) !important;
  }
  .ar-offcanvas .form-select option { background: #1a1a2e; color: #e8eaf6; }

  /* divider inside cards */
  .ar-divider { border-top: 1px solid rgba(255,255,255,0.07); }

  /* section subtitle */
  .ar-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.6px;
    text-transform: uppercase; color: #9ca3c8;
  }

  /* header wrapper */
  .ar-header-wrap {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; padding: 16px 20px;
  }
`;

export default function AnaliseRisco({ onNavigate }) {
  const [modalidades, setModalidades] = useState([]);
  const [mapaRisco, setMapaRisco] = useState([]);
  const [totals, setTotals] = useState({ valor_vendido: 0, valor_premiado: 0, val_comissao: 0, qtd_vendas: 0 });
  const [saldoLiquido, setSaldoLiquido] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [risco, setRisco] = useState('');
  const [selectedModUuid, setSelectedModUuid] = useState('');
  const [tempDateRange, setTempDateRange] = useState('');
  const [tempRisco, setTempRisco] = useState('');
  const [tempModUuid, setTempModUuid] = useState('');
  const dateInputRef = useRef(null);
  const fpInstance = useRef(null);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange(today); setTempDateRange(today);
    loadData(today, '', '', 1, false);
  }, []);

  useEffect(() => {
    if (dateInputRef.current && window.flatpickr) {
      if (fpInstance.current) fpInstance.current.destroy();
      fpInstance.current = window.flatpickr(dateInputRef.current, {
        enableTime: false, altInput: true, dateFormat: 'Y-m-d', altFormat: 'd/m/Y',
        mode: 'range', locale: { rangeSeparator: ' até ' }, defaultDate: tempDateRange,
        onChange: (_, s) => setTempDateRange(s),
      });
    }
    return () => { if (fpInstance.current) fpInstance.current.destroy(); };
  }, [tempDateRange]);

  const loadData = async (dates, rv, mu, p, append = false) => {
    p === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      const r = await api.getMapaRisco(dates, rv, mu, p);
      if (r?.success) {
        setModalidades(r.modalidades || []);
        setTotals(r.resumo || {});
        setSaldoLiquido(r.saldoLiquido || 0);
        setCurrentPage(r.mapa_risco?.current_page || 1);
        setLastPage(r.mapa_risco?.last_page || 1);
        append
          ? setMapaRisco(prev => [...prev, ...(r.mapa_risco?.data || [])])
          : setMapaRisco(r.mapa_risco?.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  const closeOffcanvas = () => {
    const el = document.getElementById('arFiltrosOffcanvas');
    if (el && window.bootstrap) {
      const inst = window.bootstrap.Offcanvas.getInstance(el);
      inst?.hide();
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setDateRange(tempDateRange); setRisco(tempRisco); setSelectedModUuid(tempModUuid);
    closeOffcanvas();
    loadData(tempDateRange, tempRisco, tempModUuid, 1, false);
  };

  const clearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setTempDateRange(today); setTempRisco(''); setTempModUuid('');
    setDateRange(today); setRisco(''); setSelectedModUuid('');
    closeOffcanvas();
    loadData(today, '', '', 1, false);
  };

  const getIcon = (ic) => {
    if (!ic) return '/assets/images/logo/icon.png';
    return ic.startsWith('http') || ic.startsWith('/') ? ic : `/storage/${ic}`;
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="ar-header-wrap d-flex align-items-center gap-3 mb-3">
        <div className="ar-icon-box ar-icon-purple" style={{ width: 48, height: 48, fontSize: 22 }}>
          <i className="icon-shield-halved"></i>
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0f2ff', margin: 0 }}>Mapa de Risco</h2>
          <small style={{ fontSize: 12, color: '#9ca3c8' }}>Análise de Lucros e Prejuízos por modalidade e dezenas vendidas</small>
        </div>
      </div>

      {/* ── Filter button ── */}
      <button
        className="ar-filter-trigger d-flex align-items-center justify-content-between p-3 border-0 mb-4"
        onClick={() => { setTempDateRange(dateRange); setTempRisco(risco); setTempModUuid(selectedModUuid); }}
        data-bs-toggle="offcanvas" data-bs-target="#arFiltrosOffcanvas"
      >
        <div className="d-flex align-items-center gap-2">
          <i className="icon-filter text-warning"></i>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Filtrar Resultados</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          {dateRange && <span className="badge ar-badge-neutral" style={{ fontSize: 10 }}><i className="icon-calendar me-1"></i>{dateRange}</span>}
          {risco && <span className={`badge ${risco === 'low' ? 'ar-badge-success' : 'ar-badge-danger'}`} style={{ fontSize: 10 }}>{risco === 'low' ? 'Lucro' : 'Prejuízo'}</span>}
          {selectedModUuid && <span className="badge ar-badge-info" style={{ fontSize: 10 }}>{modalidades.find(m => m.uuid === selectedModUuid)?.nome || 'Mod.'}</span>}
          <i className="icon-chevron-right" style={{ color: '#9ca3c8', fontSize: 13 }}></i>
        </div>
      </button>

      {/* ── Resumo Cards ──
           desktop: 2 por linha (col-md-6)
           mobile:  1 por linha (col-12)
      */}
      <div className="ar-card mb-4">
        <span className="ar-section-label mb-3 d-block">Resumo Geral do Período</span>
        <div className="row g-3">
          {[
            { label: 'Vendas Brutas', value: fmt(totals.valor_vendido), icon: 'icon-cash-register', cls: 'ar-icon-cyan' },
            { label: 'Comissões Pagas', value: fmt(totals.val_comissao), icon: 'icon-money-bills', cls: 'ar-icon-cyan' },
            { label: 'Total Premiado', value: fmt(totals.valor_premiado), icon: 'icon-trophy', cls: 'ar-icon-amber' },
            {
              label: saldoLiquido >= 0 ? 'Saldo Líquido ▲' : 'Saldo Líquido ▼',
              value: fmt(saldoLiquido),
              icon: saldoLiquido >= 0 ? 'icon-arrow-trend-up' : 'icon-arrow-trend-down',
              cls: saldoLiquido >= 0 ? 'ar-icon-green' : 'ar-icon-red',
              border: saldoLiquido >= 0 ? 'ar-border-l-green' : 'ar-border-l-red',
            },
          ].map((c, i) => (
            <div key={i} className="col-12 col-md-6">
              <div className={`ar-mini d-flex align-items-center gap-3 ${c.border || ''}`}>
                <div className={`ar-icon-box ${c.cls}`}><i className={c.icon}></i></div>
                <div>
                  <span className="ar-mini-label">{c.label}</span>
                  <span className="ar-mini-value">{c.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main list ── */}
      <div>
        <span className="ar-section-label mb-3 d-block">Detalhamento por Modalidade e Dezena</span>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }} role="status"><span className="visually-hidden">…</span></div>
            <p style={{ color: '#9ca3c8', marginTop: 12 }}>Buscando informações do mapa de risco…</p>
          </div>
        ) : mapaRisco.length === 0 ? (
          <div className="ar-card text-center py-5">
            <i className="icon-folder-open d-block mb-2" style={{ fontSize: 28, color: '#9ca3c8' }}></i>
            <span style={{ color: '#9ca3c8' }}>Nenhuma aposta com os filtros selecionados.</span>
          </div>
        ) : (
          <>
            {mapaRisco.map((item, idx) => {
              const profit = item.lucro > 0;
              return (
                <div key={idx} className="ar-card mb-3">
                  {/* row header */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-3 mb-3 ar-divider">
                    <div className="d-flex align-items-center gap-3">
                      <img src={getIcon(item.modalidade_icone)} alt="" width={38} height={38}
                        style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                        onError={e => { e.target.src = '/assets/images/logo/icon.png'; }} />
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f2ff', display: 'block' }}>
                          {item.modalidade_nome}:&nbsp;<span style={{ color: '#818cf8' }}>{item.qtd_dezenas} {item.qtd_dezenas === 1 ? 'dezena' : 'dezenas'}</span>
                        </span>
                        <span className="badge ar-badge-neutral mt-1" style={{ fontSize: 10 }}>
                          <i className="icon-ticket me-1"></i>{item.qtd_vendas} {item.qtd_vendas === 1 ? 'bilhete' : 'bilhetes'}
                        </span>
                      </div>
                    </div>
                    <span className={`badge p-2 px-3 fs-6 ${profit ? 'ar-badge-success' : 'ar-badge-danger'}`}>
                      <i className={`${profit ? 'icon-arrow-trend-up' : 'icon-arrow-trend-down'} me-2`}></i>
                      {fmt(item.lucro)}
                    </span>
                  </div>

                  {/* mini stats – 2 por linha no md, 1 no xs */}
                  <div className="row g-2">
                    {[
                      { l: 'Vendas', v: fmt(item.valor_vendido) },
                      { l: 'Comissões', v: fmt(item.val_comissao) },
                      { l: 'Premiações', v: fmt(item.valor_premiado) },
                      { l: profit ? 'Lucro' : 'Prejuízo', v: fmt(item.lucro), border: profit ? 'ar-border-l-green' : 'ar-border-l-red' },
                    ].map((s, si) => (
                      <div key={si} className="col-12 col-md-6">
                        <div className={`ar-mini py-2 ${s.border || ''}`}>
                          <span className="ar-mini-label">{s.l}</span>
                          <span className="ar-mini-value">{s.v}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {currentPage < lastPage && (
              <div className="text-center mt-4 mb-5">
                <button className="btn btn-primary px-4 py-2" onClick={() => loadData(dateRange, risco, selectedModUuid, currentPage + 1, true)} disabled={loadingMore} style={{ borderRadius: 8, fontWeight: 600 }}>
                  {loadingMore ? <><span className="spinner-border spinner-border-sm me-2"></span>Carregando…</> : 'Carregar Mais Resultados'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Offcanvas ── */}
      <div className="offcanvas offcanvas-end ar-offcanvas" tabIndex="-1" id="arFiltrosOffcanvas">
        <div className="offcanvas-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h5 className="offcanvas-title fw-bold" style={{ color: '#f0f2ff' }}>
            <i className="icon-filter me-2 text-warning"></i>Filtrar Mapa de Risco
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={applyFilters}>
            <div className="mb-3">
              <label className="form-label">Período do Sorteio</label>
              <input ref={dateInputRef} type="text" className="form-control" placeholder="Selecione as datas" value={tempDateRange} onChange={e => setTempDateRange(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Classificar Resultado</label>
              <select className="form-select" value={tempRisco} onChange={e => setTempRisco(e.target.value)}>
                <option value="">Todos</option>
                <option value="low">Apenas Lucro (Baixo Risco)</option>
                <option value="high">Apenas Prejuízo (Alto Risco)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Modalidade</label>
              <select className="form-select" value={tempModUuid} onChange={e => setTempModUuid(e.target.value)}>
                <option value="">Todas</option>
                {modalidades.map(m => <option key={m.uuid} value={m.uuid}>{m.nome}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-success w-100 py-2 mt-3" style={{ borderRadius: 8, fontWeight: 600 }}>
              <i className="icon-filter me-2"></i>Aplicar Filtros
            </button>
            <button type="button" onClick={clearFilters} className="btn btn-outline-secondary w-100 py-2 mt-2" style={{ borderRadius: 8 }}>
              Limpar Filtros
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
