import React, { useState } from 'react';

export default function Wallet() {
  const [balance, setBalance] = useState(1542.50);

  return (
    <>
      <div className="row g-20">
        <div className="col-md-12">
          <div className="card__wrapper mb-1" style={{ padding: '15px !important' }}>
            <div className="d-flex align-items-center gap-sm">
              <div className="card__icon" style={{ fontSize: '16px !important' }}>
                <span style={{ width: '50px', height: '50px' }}>
                  <i className="icon-user" style={{ fontSize: '16px !important' }}></i>
                </span>
              </div>
              <div className="card__title-wrap">
                <h6 style={{ fontSize: '16px !important' }}>Administrador Geral</h6>
                <div className="d-flex flex-wrap align-items-end mt-1">
                  <small style={{ fontSize: '14px !important' }}>(11) 99999-9999</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-20 mt-4">
        <div className="col-md-12">
          <div className="card__wrapper">
            <h6 className="text-muted">Saldo disponível para apostas</h6>
            <h1 className="mt-2">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>

            <div className="d-flex flex-column flex-md-row gap-2 mt-3">
              <button className="btn btn-success w-100 w-md-auto" onClick={() => alert('Modal: Adicionar Crédito')}>
                <i className="icon-dollar-sign"></i> Adicionar Crédito
              </button>

              <button className="btn btn-danger w-100 w-md-auto" onClick={() => alert('Modal: Remover Crédito')}>
                <i className="icon-dollar-sign"></i> Remover Crédito
              </button>

              <button className="btn btn-warning w-100 w-md-auto" onClick={() => alert('Modal: Desabilitar Carteira')}>
                <i className="icon-wallet"></i> Desabilitar Carteira
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-12 mt-2">
          <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
            <a href="#relatorio-vendas" className="mt-1 p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <i className="icon-chart-simple text-light fs-5"></i>
                <div>
                  <div className="theme-text-color ms-3 mt-1">Relatório de Vendas</div>
                  <small className="ms-3 text-muted">Comissão: 20%</small>
                </div>
              </div>
              <i className="icon-chevron-right text-muted"></i>
            </a>

            <a href="#relatorio-creditos" className="mt-1 p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <i className="icon-dollar-sign text-light fs-5"></i>
                <div>
                  <div className="theme-text-color ms-3 mt-1">Relatório de Créditos</div>
                  <small className="ms-3 text-muted">Débitos, Créditos e Comissões</small>
                </div>
              </div>
              <i className="icon-chevron-right text-muted"></i>
            </a>

            <a href="#fechamento-caixa" className="mt-1 p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <i className="icon-credit-card text-light fs-5"></i>
                <div>
                  <div className="theme-text-color ms-3 mt-1">Fechamento de Caixa</div>
                  <small className="ms-3 text-muted">Saldo e Transações</small>
                </div>
              </div>
              <i className="icon-chevron-right text-muted"></i>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
