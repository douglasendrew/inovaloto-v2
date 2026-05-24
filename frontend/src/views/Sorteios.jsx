import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Sorteios() {
  const [sorteios, setSorteios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSorteios();
  }, []);

  const loadSorteios = async () => {
    try {
      setLoading(true);
      const data = await api.getSorteios();
      setSorteios(data);
    } catch (error) {
      console.error('Error loading sorteios:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportApostas = () => {
    alert('Função de exportar apostas será inicializada...');
  };

  return (
    <>
      <div className="row g-20">
        <div className="col-md-12">
          <div className="card__wrapper" style={{ padding: '15px !important' }}>
            <div className="d-flex align-items-center">
              <div className="card__icon" style={{ fontSize: '16px !important' }}>
                <span style={{ width: '50px', height: '50px' }}>
                  <i className="icon-wreath-laurel" style={{ fontSize: '16px !important' }}></i>
                </span>
              </div>
              <div className="card__title-wrap">
                <h2 className="card__sub-title mb-10 mt-2 ms-2">Sorteios</h2>
              </div>
              <div className="ms-auto">
                <div className="dropdown">
                  <button className="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="icon-grip-lines"></i> Opções
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="#novo-sorteio" onClick={(e) => { e.preventDefault(); alert('Novo Sorteio'); }}>
                        <i className="icon-square-plus"></i> Novo Sorteio
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item btn-export-txt" href="#exportar" onClick={(e) => { e.preventDefault(); exportApostas(); }}>
                        <i className="icon-file-export"></i> Exportar Apostas
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-20 mt-3">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            <a href="#filtros" className="p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <i className="icon-filter text-warning fs-5"></i>
                <span className="theme-text-color ms-3 mt-1">Filtros</span>
              </div>
              <i className="icon-chevron-right text-muted"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : sorteios.length > 0 ? (
              sorteios.map((item) => (
                <a key={item.id} href="#edit-sorteio" className="mt-1 p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ width: '40px', height: '40px', background: 'rgba(101, 90, 252, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      <i className="icon-dice text-primary fs-5"></i>
                    </span>
                    <div>
                      <span className="theme-text-color ms-3 mt-1">
                        <b>Lotofácil</b> - Concurso {item.concurso}
                      </span>
                      <div className="ms-3">
                        <small className="text-muted">
                          <small>
                            {item.status === 'pending' && <span className="bd-badge bg-theme" style={{ padding: '5px !important' }}>Aguard. Conferência</span>}
                            {item.status === 'completed' && <span className="bd-badge bg-success" style={{ padding: '5px !important' }}>Conferido</span>}
                          </small>
                          <span className="ms-1">• Sorteio em <b>{new Date(item.draw_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</b></span>
                        </small>
                      </div>
                    </div>
                  </div>
                  <i className="icon-chevron-right text-muted"></i>
                </a>
              ))
            ) : (
              <div className="text-center mt-3 py-5">
                <h6 className="text-muted">Nenhum sorteio para ser mostrado</h6>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
