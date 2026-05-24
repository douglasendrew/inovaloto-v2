import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Dashboard({ user, onNavigate }) {
  const [stats, setStats] = useState({
    sales: 0,
    tickets: 0,
    commission: 0,
    balance: 0,
    winners: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const ticketList = await api.getTickets() || [];
        
        const totalSales = ticketList.reduce((acc, curr) => acc + curr.amount, 0);
        const wonTickets = ticketList.filter(t => t.status === 'won');
        const totalWinners = wonTickets.reduce((acc, curr) => acc + curr.potential_prize, 0);
        
        // Commission (default 20%)
        const totalComm = ticketList.reduce((acc, curr) => acc + (curr.amount * 0.20), 0);

        setStats({
          sales: totalSales,
          tickets: ticketList.length,
          commission: totalComm,
          balance: totalSales - totalComm - totalWinners,
          winners: wonTickets.length,
          winnerValue: totalWinners
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    
    loadDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      <div className="row g-20">
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

      <div className="row g-20 mt-4">
        <div className="col-md-12">
          <div className="card__wrapper glass">
            <div className="text-center">
              <div className="card__title-wrap">
                <h6 className="text-muted mb-10">Saldo da Banca</h6>
                <h4 className={`card__title refresh-field d-flex align-items-center gap-2 justify-content-center ${stats.balance > 0 ? 'text-success' : 'text-danger'}`}>
                  <i className="icon-wallet"></i>
                  <span className="refresh-text">{formatCurrency(stats.balance)}</span>
                  <button className="btn btn-sm text-primary p-0" type="button" title="Atualizar dados">
                    <i className="icon-rotate-right fs-6"></i>
                  </button>
                </h4>
                <div className="mt-2">
                  <small className="mt-3">Hoje</small>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card__wrapper glass2">
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className="mini-card-icon icon-color-info">
                      <i className="icon-cash-register"></i>
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Vendas</small>
                        <h6 className="text-light refresh-field">
                          <span className="refresh-text">{formatCurrency(stats.sales)}</span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mt-4 mt-sm-0">
                <div className="card__wrapper glass2">
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className="mini-card-icon icon-warning">
                      <i className="icon-money-bills"></i>
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Comissões</small>
                        <h6 className="text-danger refresh-field">
                          <span className="refresh-text">{formatCurrency(stats.commission)}</span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mt-4 mt-sm-2">
                <div className="card__wrapper glass2">
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className="mini-card-icon icon-warning">
                      <i className="icon-trophy"></i>
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Premiações</small>
                        <h6 className="text-danger refresh-field">
                          <span className="refresh-text">{formatCurrency(stats.winnerValue)}</span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mt-4 mt-sm-2">
                <div className={`card__wrapper glass2 ${stats.balance <= 0 ? 'card-danger' : 'card-success'}`}>
                  <div className="d-flex align-items-center gap-4 g-4">
                    <div className={`mini-card-icon ${stats.balance <= 0 ? 'icon-danger' : 'icon-success'}`}>
                      {stats.balance <= 0 ? <i className="icon-arrow-trend-down"></i> : <i className="icon-arrow-trend-up"></i>}
                    </div>
                    <div className="text-start">
                      <div>
                        <small className="text-muted mb-10">Saldo Líquido</small>
                        <h6 className={`refresh-field ${stats.balance <= 0 ? 'text-danger' : 'text-success'}`}>
                          <span className="refresh-text">{formatCurrency(stats.balance)}</span>
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

      <div className="row g-20 mt-3">
        <div className="col-md-12">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            <a href="#bilhetes" className="list-group-item list-group-item-action d-flex align-items-center justify-content-between glass">
              <div className="d-flex align-items-center gap-3">
                <span className="mini-card-icon icon-light">
                  <i className="icon-file-lines"></i>
                </span>
                <div className="ms-3">
                  <span className="theme-text-color mt-1">Total de Bilhetes</span>
                  <div className="text-muted refresh-field">
                    <span className="refresh-text">{stats.tickets}</span>
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
            <a href="#extrato" className="list-group-item list-group-item-action d-flex align-items-center justify-content-between glass">
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
    </>
  );
}
