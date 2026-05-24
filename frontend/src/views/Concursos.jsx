import React, { useState } from 'react';

export default function Concursos() {
  const [activeTab, setActiveTab] = useState('digitGames');
  const [ticketValue, setTicketValue] = useState('');
  const [selectedDozens, setSelectedDozens] = useState([]);
  const [maxDozens, setMaxDozens] = useState(15);
  const [surpresaAmount, setSurpresaAmount] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  // Mock data for the layout
  const numbersStartFrom = 1;
  const maxNumbers = 25;
  const allowedDozens = [15, 16, 17, 18, 19, 20];

  const handleNumberSelect = (number) => {
    if (selectedDozens.includes(number)) {
      setSelectedDozens(selectedDozens.filter((n) => n !== number));
    } else {
      if (selectedDozens.length < maxDozens) {
        setSelectedDozens([...selectedDozens, number]);
      } else {
        alert(`Você só pode selecionar até ${maxDozens} dezenas.`);
      }
    }
  };

  const handleAddSurpresinha = () => {
    setSurpresaAmount(prev => prev + 1);
  };
  
  const handleRemoveSurpresinha = () => {
    if (surpresaAmount > 1) {
      setSurpresaAmount(prev => prev - 1);
    }
  };

  const saveGame = () => {
    if (selectedDozens.length < 15) {
      alert('Selecione ao menos 15 dezenas');
      return;
    }
    setCartCount(prev => prev + 1);
    setSelectedDozens([]);
    alert('Jogo adicionado ao carrinho!');
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="card__wrapper">
            <div className="d-flex align-items-center gap-sm">
              <div className="ms-2">
                <span style={{ width: '40px', height: '40px', background: 'rgba(101, 90, 252, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <i className="icon-dice text-primary fs-4"></i>
                </span>
              </div>
              <div className="card__title-wrap ms-3">
                <div style={{ fontSize: '16px !important' }}><b>Lotofácil</b> - Concurso 1234</div>
                <div className="d-flex flex-wrap align-items-end mt-1">
                  <small style={{ fontSize: '14px !important' }}>Sorteio em <b>Hoje 20:00</b></small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12 mt-3">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
                <a href="#calculadora" className="p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <i className="icon-calculator-simple text-warning fs-5"></i>
                    <span className="ms-3 mt-1 theme-text-color">Calculadora de Premiações</span>
                  </div>
                  <i className="icon-chevron-right text-muted"></i>
                </a>
              </div>
            </div>
            <div className="col-md-6 mt-3 mt-sm-0">
              <div className="list-group shadow-sm rounded-3 overflow-hidden border-0">
                <a href="#carrinho" className="p-3 border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between cart-trigger-btn">
                  <div className="d-flex align-items-center gap-3">
                    <i className="icon-cart-shopping text-primary fs-5"></i>
                    <span className="ms-3 mt-1 theme-text-color">
                      <span className="bd-badge badge-circle bg-primary text-white me-2" style={{ marginInlineStart: '0 !important' }}>
                        <b id="countBilhetes">{cartCount}</b>
                      </span> 
                      Carrinho
                    </span>
                  </div>
                  <i className="icon-chevron-right text-muted"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12">
          <div className="card__wrapper">
            <div className="row mb-4">
              <div className="col-md-12">
                <label>Valor do Bilhete</label>
                <div className="from__input-box has-icon input-icon-left">
                  <div className="form__input">
                    <input 
                      className="form-control moneyMask" 
                      type="number" 
                      placeholder="Ex: 5,00"
                      value={ticketValue}
                      onChange={(e) => setTicketValue(e.target.value)}
                    />
                    <div><span>R$</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="nav nav-tabs-modern" role="tablist">
              <div className="nav-item">
                <button className={`nav-link ${activeTab === 'importGames' ? 'active' : ''}`} onClick={() => setActiveTab('importGames')}>
                  <i className="icon-file-import"></i> <span>Importar</span>
                </button>
              </div>
              <div className="nav-item">
                <button className={`nav-link ${activeTab === 'digitGames' ? 'active' : ''}`} onClick={() => setActiveTab('digitGames')}>
                  <i className="icon-keyboard"></i> <span>Digitar</span>
                </button>
              </div>
              <div className="nav-item">
                <button className={`nav-link ${activeTab === 'surpresinha' ? 'active' : ''}`} onClick={() => setActiveTab('surpresinha')}>
                  <i className="icon-wand-magic-sparkles"></i> <span>Surpresinha</span>
                </button>
              </div>
            </div>

            <div className="tab-content mt-3">
              {activeTab === 'importGames' && (
                <div className="tab-pane fade show active">
                  <p className="text-center">Para importar os jogos, basta colar cada jogo em uma linha.</p>
                  <div className="mt-2">
                    <div className="editor-wrapper">
                      <div className="line-numbers">
                        <div>1</div>
                        <div>2</div>
                        <div>3</div>
                      </div>
                      <textarea className="form-control" spellCheck="false" style={{ flex: 1, border: 'none', background: 'transparent' }}></textarea>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <button className="btn btn-light me-2">Limpar</button>
                    <button className="btn btn-success">Importar</button>
                  </div>
                </div>
              )}

              {activeTab === 'digitGames' && (
                <div className="tab-pane fade show active">
                  <div>
                    <p className="text-center">Quantidade de dezenas:</p>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      {allowedDozens.map(qtd => (
                        <button key={qtd} className={`btn ${maxDozens === qtd ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMaxDozens(qtd)}>
                          {qtd}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="row gap-2 mt-2 justify-content-center mx-auto" style={{ maxWidth: '500px' }}>
                      {Array.from({ length: maxNumbers - numbersStartFrom + 1 }, (_, i) => i + numbersStartFrom).map(num => (
                        <div key={num} className="col-2" style={{ width: '50px', height: '50px' }}>
                          <button 
                            type="button" 
                            className={`btn ${selectedDozens.includes(num) ? 'btn-primary' : 'btn-light'} w-100 btn-circle`}
                            onClick={() => handleNumberSelect(num)}
                          >
                            {num.toString().padStart(2, '0')}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-4">
                      Dezenas Selecionadas: <b><span className={selectedDozens.length === maxDozens ? 'text-success' : ''}>{selectedDozens.length}</span></b>
                    </div>

                    <div className="text-center mt-4">
                      <button className="btn btn-success me-2" onClick={saveGame}>Salvar Jogo</button>
                      <button className="btn btn-light" onClick={() => setSelectedDozens([])}>Limpar</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'surpresinha' && (
                <div className="tab-pane fade show active">
                  <p className="text-center mt-4"><b>Quantidade de dezenas:</b></p>
                  <div className="d-flex flex-wrap gap-1 justify-content-center">
                    {allowedDozens.map(qtd => (
                      <button key={qtd} className={`btn ${maxDozens === qtd ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMaxDozens(qtd)}>
                        {qtd}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="text-center"><b>Quantidade de jogos:</b></p>
                    <div className="input-group mx-auto" style={{ maxWidth: '200px' }}>
                      <button className="btn btn-primary" type="button" onClick={handleRemoveSurpresinha}>−</button>
                      <input type="number" className="form-control text-center bg-transparent theme-text-color" value={surpresaAmount} readOnly />
                      <button className="btn btn-primary" type="button" onClick={handleAddSurpresinha}>+</button>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <button className="btn btn-success me-2" onClick={() => { setCartCount(prev => prev + surpresaAmount); alert('Surpresinhas adicionadas ao carrinho!'); }}>Gerar Bilhetes</button>
                    <button className="btn btn-light" onClick={() => setSurpresaAmount(1)}>Limpar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
