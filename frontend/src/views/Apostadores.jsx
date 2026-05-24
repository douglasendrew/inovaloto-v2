import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Apostadores() {
  const [apostadores, setApostadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApostadores();
  }, []);

  const loadApostadores = async () => {
    try {
      setLoading(true);
      const data = await api.getApostadores();
      setApostadores(data);
    } catch (error) {
      console.error('Error loading apostadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApostadores = apostadores.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyLink = () => {
    navigator.clipboard.writeText('https://inovaloto.com.br/registro-apostador');
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
                <h3 className="card__sub-title mb-10 mt-2 ms-2">Apostadores</h3>
              </div>
              <div className="ms-auto">
                <button className="btn btn-primary" onClick={() => alert('Abrir modal de Novo Apostador')}>
                  Novo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-20">
        <div className="col-md-12">
          <div className="card__wrapper mt-3 mb-3" style={{ padding: '20px !important', border: '1px dashed var(--border-rgba)', background: 'rgba(101, 90, 252, 0.05)', borderRadius: '12px' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="card__icon" style={{ fontSize: '20px !important' }}>
                <span style={{ width: '45px', height: '45px', background: 'rgba(101, 90, 252, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
                  <i className="icon-user-plus text-primary"></i>
                </span>
              </div>
              <div className="ms-3">
                <h4 className="mb-0" style={{ fontSize: '16px', fontWeight: '600' }}>Recrutar Novos Apostadores</h4>
                <p className="text-muted small mb-0">Compartilhe seu link exclusivo para cadastrar novos clientes automaticamente vinculados a você.</p>
              </div>
            </div>
            
            <div className="input-group">
              <input type="text" className="form-control bg-transparent theme-text-color border-rgba ps-3" 
                     value="https://inovaloto.com.br/registro-apostador" 
                     readOnly 
                     style={{ borderRadius: '10px 0 0 10px', fontSize: '14px', borderRight: 'none' }} />
              <button className="btn btn-primary px-4 copy-link-btn" 
                      type="button" 
                      onClick={copyLink}
                      style={{ borderRadius: '0 10px 10px 0', fontWeight: '600', fontSize: '13px' }}>
                <i className="icon-copy me-1"></i> Copiar Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-20">
        <div className="col-md-12">
          <div className="card__wrapper mb-3 theme-bg-color" style={{ padding: '12px 15px !important', border: '1px solid var(--border-rgba)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 pe-0">
                <i className="icon-filter text-muted" style={{ fontSize: '18px', opacity: '0.8' }}></i>
              </span>
              <input type="text" className="form-control bg-transparent theme-text-color border-0 ps-2 filter-input" 
                     placeholder="Buscar apostador..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     style={{ boxShadow: 'none', fontSize: '15px', borderRadius: '0' }} />
              
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
            ) : filteredApostadores.length > 0 ? (
              filteredApostadores.map((item) => (
                <a key={item.id} href="#apostador" className={`mt-1 p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between searchable-item ${item.status === 'disabled' ? 'opacity-50' : ''}`}>
                  <div className="d-flex align-items-center gap-3">
                    <i className={`icon-user ${item.status === 'disabled' ? 'text-muted' : 'text-primary'} fs-5`}></i>
                    <div>
                      <span className="ms-3 mt-1 theme-text-color" style={{ fontWeight: '500' }}>
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
                <h6 className="text-muted">Nenhum apostador encontrado</h6>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
