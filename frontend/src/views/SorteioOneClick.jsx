import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

export default function SorteioOneClick({ onNavigate }) {
  const [modalidades, setModalidades] = useState([]);
  const [loadingModalidades, setLoadingModalidades] = useState(true);

  // Selected modality UUIDs (checkbox list)
  const [selectedModalidades, setSelectedModalidades] = useState([]);

  // Form fields
  const [dataSorteio, setDataSorteio] = useState('');
  const [dataLimiteAposta, setDataLimiteAposta] = useState('');
  const [dataLimiteExcluir, setDataLimiteExcluir] = useState('');
  const [dataInicioVenda, setDataInicioVenda] = useState('');
  const [inicioVendaImediato, setInicioVendaImediato] = useState(true);

  // UI states
  const [loadingDates, setLoadingDates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: string }

  useEffect(() => {
    loadModalidades();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadModalidades = async () => {
    setLoadingModalidades(true);
    try {
      const data = await api.getModalidades();
      setModalidades(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModalidades(false);
    }
  };

  // When a checkbox is toggled ON, fetch modality data and auto-fill dates
  const handleCheckboxChange = async (uuid, checked) => {
    if (checked) {
      setSelectedModalidades(prev => [...prev, uuid]);

      // Clear previous date values — last checked wins (same behaviour as blade)
      setDataSorteio('');
      setDataLimiteAposta('');
      setDataLimiteExcluir('');

      setLoadingDates(true);
      try {
        const data = await api.getModalityData(uuid);
        if (data && data.success) {
          if (data.data_sorteio)             setDataSorteio(data.data_sorteio);
          if (data.data_limite_aposta)        setDataLimiteAposta(data.data_limite_aposta);
          if (data.data_limite_excluir_aposta) setDataLimiteExcluir(data.data_limite_excluir_aposta);
        }
      } catch (err) {
        console.error('Erro ao buscar dados da modalidade:', err);
      } finally {
        setLoadingDates(false);
      }
    } else {
      setSelectedModalidades(prev => prev.filter(v => v !== uuid));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedModalidades.length === 0) {
      showToast('error', 'Selecione ao menos uma modalidade.');
      return;
    }
    if (!dataSorteio) {
      showToast('error', 'Informe a data do sorteio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        modalidade_item: selectedModalidades,
        data_sorteio: dataSorteio,
        data_limite_aposta: dataLimiteAposta || null,
        data_limite_excluir_aposta: dataLimiteExcluir || null,
        data_inicio_venda: inicioVendaImediato ? null : (dataInicioVenda || null),
        inicio_venda_imediato: inicioVendaImediato ? 1 : 0,
      };

      const result = await api.saveOneClickSorteio(payload);

      if (result && result.success) {
        showToast('success', result.message || 'Sorteio(s) gerado(s) com sucesso!');
        // Reset form
        setSelectedModalidades([]);
        setDataSorteio('');
        setDataLimiteAposta('');
        setDataLimiteExcluir('');
        setDataInicioVenda('');
        setInicioVendaImediato(true);
        // Redirect to sorteios list after short delay
        setTimeout(() => onNavigate('sorteios'), 1500);
      } else {
        showToast('error', result?.error || 'Erro ao salvar sorteio.');
      }
    } catch (err) {
      showToast('error', err.message || 'Erro ao salvar sorteio.');
    } finally {
      setSaving(false);
    }
  };

  const getIconUrl = (icone) => {
    if (!icone) return '/assets/images/logo/icon.png';
    if (icone.startsWith('http') || icone.startsWith('/')) return icone;
    return `/storage/${icone}`;
  };

  return (
    <>
      <style>{`
        .modalidade-list-item {
          transition: background 0.2s ease;
        }
        .modalidade-list-item:hover {
          background: rgba(108, 95, 252, 0.08) !important;
        }
        .modalidade-list-item.selected {
          background: rgba(108, 95, 252, 0.15) !important;
          border-left: 3px solid #6c5ffc !important;
        }
        .form__input .form-control {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d1d5db;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .form__input .form-control:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #6c5ffc;
          color: #fff;
          box-shadow: 0 0 0 3px rgba(108, 95, 252, 0.2);
          outline: none;
        }
        html[bd-theme="bd-theme-light"] .form__input .form-control {
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        html[bd-theme="bd-theme-light"] .form__input .form-control:focus {
          background: #fff;
          border-color: #6c5ffc;
          color: #1e293b;
        }
        .accordion-item {
          background: rgba(25, 25, 30, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.07) !important;
          border-radius: 10px !important;
        }
        .accordion-button {
          background: rgba(30, 30, 38, 0.6) !important;
          color: #d1d5db !important;
          border-radius: 10px !important;
          box-shadow: none !important;
        }
        .accordion-button:not(.collapsed) {
          background: rgba(108, 95, 252, 0.15) !important;
          color: #a89dff !important;
        }
        .accordion-button::after {
          filter: invert(0.8) brightness(2);
        }
        .accordion-body {
          background: rgba(20, 20, 25, 0.4) !important;
        }
        html[bd-theme="bd-theme-light"] .accordion-item {
          background: #fff !important;
          border: 1px solid #e2e8f0 !important;
        }
        html[bd-theme="bd-theme-light"] .accordion-button {
          background: #f8fafc !important;
          color: #334155 !important;
        }
        html[bd-theme="bd-theme-light"] .accordion-button::after {
          filter: none;
        }
        html[bd-theme="bd-theme-light"] .accordion-body {
          background: #fff !important;
        }
        .toast-overlay {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 300px;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .date-loading-spinner {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
        }
      `}</style>

      {/* Toast notification */}
      {toast && (
        <div className={`toast-overlay alert alert-${toast.type === 'success' ? 'success' : 'danger'} d-flex align-items-center gap-2`}>
          <i className={`icon-${toast.type === 'success' ? 'circle-check' : 'circle-xmark'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="row g-20">
        <div className="col-md-12">
          <div className="card__wrapper" style={{ padding: '15px' }}>
            <div className="d-flex align-items-center">
              <div className="card__icon">
                <span style={{ width: '50px', height: '50px' }}>
                  <i className="icon-square-plus" style={{ fontSize: '20px' }}></i>
                </span>
              </div>
              <div className="card__title-wrap">
                <h2 className="card__sub-title mb-10 mt-2 ms-2">1-Click Add Sorteio</h2>
              </div>
              <div className="ms-auto">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => onNavigate('sorteios')}
                >
                  <i className="icon-arrow-left me-1"></i> Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Modality List */}
        <div className="row g-20 mt-3">
          <div className="col-md-12">
            <label className="mb-2 d-block theme-text-color">Modalidade</label>
            <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
              {loadingModalidades ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-2 text-muted small">Carregando modalidades...</p>
                </div>
              ) : modalidades.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  Nenhuma modalidade disponível.
                </div>
              ) : (
                modalidades.map((item) => {
                  const isSelected = selectedModalidades.includes(item.uuid);
                  return (
                    <a
                      key={item.uuid}
                      href="javascript:void(0)"
                      className={`p-3 mt-1 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between modalidade-list-item${isSelected ? ' selected' : ''}`}
                      onClick={() => handleCheckboxChange(item.uuid, !isSelected)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="form-check form-check-primary me-2 mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="modalidade_item[]"
                            value={item.uuid}
                            checked={isSelected}
                            onChange={() => {}} // controlled via onClick on parent
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(item.uuid, !isSelected);
                            }}
                          />
                        </div>
                        <img
                          src={getIconUrl(item.icone)}
                          alt={item.nome}
                          width="40"
                          height="40"
                          style={{ borderRadius: '8px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/assets/images/logo/icon.png'; }}
                        />
                        <div>
                          <span className="theme-text-color ms-2">{item.nome}</span>
                        </div>
                      </div>
                      {loadingDates && isSelected && (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Carregando...</span>
                        </div>
                      )}
                    </a>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Date Card */}
        <div className="row g-20 mt-4">
          <div className="col-md-12">
            <div className="card__wrapper">
              {/* Data do Sorteio */}
              <div className="row">
                <div className="col-md-12">
                  <label className="form-label theme-text-color">Data do Sorteio <span className="text-danger">*</span></label>
                  <div className="form__input position-relative">
                    <input
                      className="form-control"
                      type="datetime-local"
                      name="data_sorteio"
                      value={dataSorteio}
                      onChange={(e) => setDataSorteio(e.target.value)}
                      required
                    />
                    {loadingDates && (
                      <div className="date-loading-spinner">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Outras Opções — Accordion */}
              <div className="col-md-12 mt-3">
                <div className="accordion-style">
                  <div className="accordion accordion-primary" id="accordionOutrasOpcoes">
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingOutras">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseOutras"
                          aria-expanded="false"
                          aria-controls="collapseOutras"
                        >
                          Outras Opções
                        </button>
                      </h2>
                      <div
                        id="collapseOutras"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingOutras"
                        data-bs-parent="#accordionOutrasOpcoes"
                      >
                        <div className="accordion-body">
                          <div className="row">

                            {/* Limite cadastro apostas */}
                            <div className="col-md-12">
                              <label className="form-label theme-text-color">Horário limite para cadastro de apostas</label>
                              <div className="form__input">
                                <input
                                  className="form-control"
                                  type="datetime-local"
                                  name="data_limite_aposta"
                                  value={dataLimiteAposta}
                                  onChange={(e) => setDataLimiteAposta(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Limite exclusão apostas */}
                            <div className="col-md-12 mt-3">
                              <label className="form-label theme-text-color">Horário limite para exclusão de apostas</label>
                              <div className="form__input">
                                <input
                                  className="form-control"
                                  type="datetime-local"
                                  name="data_limite_excluir_aposta"
                                  value={dataLimiteExcluir}
                                  onChange={(e) => setDataLimiteExcluir(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Início da venda */}
                            <div className="col-md-12 mt-3">
                              <label className="form-label theme-text-color">Início da venda dos bilhetes</label>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="inicioVendasImediatamente"
                                  name="inicio_venda_imediato"
                                  checked={inicioVendaImediato}
                                  onChange={(e) => setInicioVendaImediato(e.target.checked)}
                                />
                                <label className="form-check-label text-muted" htmlFor="inicioVendasImediatamente">
                                  Imediatamente
                                </label>
                              </div>
                              {!inicioVendaImediato && (
                                <div className="form__input mt-3">
                                  <input
                                    className="form-control"
                                    type="datetime-local"
                                    name="data_inicio_venda"
                                    value={dataInicioVenda}
                                    onChange={(e) => setDataInicioVenda(e.target.value)}
                                    required={!inicioVendaImediato}
                                  />
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                className="btn btn-primary w-100 mt-3"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="icon-floppy-disk me-2"></i>
                    Salvar Sorteio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
