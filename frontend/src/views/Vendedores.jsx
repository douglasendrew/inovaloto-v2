import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Vendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    try {
      setLoading(true);
      const data = await api.getVendedores();
      setVendedores(data);
    } catch (error) {
      console.error('Error loading vendedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendedores = vendedores.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyLink = () => {
    navigator.clipboard.writeText('https://inovaloto.com.br/registro-consultor');
    alert('Link copiado com sucesso!');
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
                <h3 className="card__sub-title mb-10 mt-2 ms-2">Vendedores</h3>
              </div>
              <div className="ms-auto">
                <button className="btn btn-primary" onClick={() => alert('Abrir modal de Novo Vendedor')}>
                  Novo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-20 mt-3">
        <div className="col-md-12">
          <div className="card__wrapper mb-3" style={{ padding: '12px 15px !important', background: 'rgba(101, 90, 252, 0.1) !important', border: '1px dashed rgba(101, 90, 252, 0.3)', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <i className="icon-user-plus text-primary fs-5"></i>
                <div className="ms-3">
                  <div className="text-muted small">Link para novos Consultores</div>
                  <small className="theme-text-color fw-bold">https://inovaloto.com.br/registro-consultor</small>
                </div>
              </div>
              <button className="btn btn-sm btn-outline-primary copy-btn" onClick={copyLink} title="Copiar Link">
                <i className="icon-copy me-1"></i> Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-20 mt-1">
        <div className="col-md-12">
          <div className="card__wrapper mb-3" style={{ padding: '12px 15px !important', background: 'rgba(33, 33, 33, 0.4) !important', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 pe-0">
                <i className="icon-filter text-white" style={{ fontSize: '18px', opacity: '0.8' }}></i>
              </span>
              <input 
                type="text" 
                className="form-control bg-transparent text-white border-0 ps-2 filter-input" 
                placeholder="Buscar vendedor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ boxShadow: 'none', fontSize: '15px', borderRadius: '0', color: 'white !important' }} 
              />
              {searchTerm && (
                <button className="btn btn-link text-muted border-0 d-flex align-items-center justify-content-center px-2" onClick={() => setSearchTerm('')} style={{ textDecoration: 'none' }}>
                  <i className="icon-xmark-large" style={{ fontSize: '14px' }}></i>
                </button>
              )}
              <button className="btn btn-primary px-4 ms-2" style={{ borderRadius: '10px', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(101, 90, 252, 0.2)' }}>
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-1" id="list-container">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : filteredVendedores.length > 0 ? (
              filteredVendedores.map((item) => (
                <a key={item.id} href="#vendedor" className={`mt-1 p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between searchable-item ${item.status === 'disabled' ? 'opacity-50' : ''}`}>
                  <div className="d-flex align-items-center gap-3">
                    <i className={`icon-user ${item.status === 'disabled' ? 'text-muted' : 'text-primary'} fs-5`}></i>
                    <div>
                      <span className="theme-text-color ms-3 mt-1">
                        {item.name} 
                        {item.status === 'disabled' && <span className="badge bg-danger ms-2">Desativado</span>}
                      </span>
                      <div className="ms-3"><small className="text-muted">{item.phone || '(00) 0000-0000'}</small></div>
                    </div>
                  </div>
                  <i className="icon-chevron-right text-muted"></i>
                </a>
              ))
            ) : (
              <div className="text-center py-5">
                <i className="icon-user-xmark fs-2 text-muted mb-3 d-block"></i>
                <h6 className="text-muted">Nenhum vendedor encontrado</h6>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
