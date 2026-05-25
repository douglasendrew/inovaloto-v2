// Centralized API utility with Mock Fallback for offline testing
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

// Local storage state initialization for mock testing
const initMockDB = () => {
  if (!localStorage.getItem('inovaloto_sellers')) {
    localStorage.setItem('inovaloto_sellers', JSON.stringify([
      { id: 1, name: 'Douglas Consultor', email: 'douglas@banca.com', whatsapp: '(11) 99999-9999', commission: 20, status: 'active', limit_lotinha: 5000, limit_seninha: 3000 },
      { id: 2, name: 'Lucas Vendas', email: 'lucas@banca.com', whatsapp: '(11) 98888-8888', commission: 15, status: 'active', limit_lotinha: 4000, limit_seninha: 2500 },
      { id: 3, name: 'Juliana Sorte', email: 'juliana@banca.com', whatsapp: '(11) 97777-7777', commission: 18, status: 'inactive', limit_lotinha: 4500, limit_seninha: 2800 }
    ]));
  }

  if (!localStorage.getItem('inovaloto_players')) {
    localStorage.setItem('inovaloto_players', JSON.stringify([
      { id: 1, name: 'Roberto Silva', whatsapp: '(11) 96666-6666', balance: 350.00, status: 'active' },
      { id: 2, name: 'Amanda Souza', whatsapp: '(11) 95555-5555', balance: 120.50, status: 'active' },
      { id: 3, name: 'Carlos Santos', whatsapp: '(11) 94444-4444', balance: 0.00, status: 'inactive' }
    ]));
  }

  if (!localStorage.getItem('inovaloto_contests')) {
    localStorage.setItem('inovaloto_contests', JSON.stringify([
      { id: 1, number: '2981', modality: 'Lotinha', date: '2026-05-24', status: 'open', price_per_dozen: 2.0 },
      { id: 2, number: '1042', modality: 'Seninha', date: '2026-05-24', status: 'open', price_per_dozen: 2.5 },
      { id: 3, number: '4822', modality: 'Quininha', date: '2026-05-25', status: 'open', price_per_dozen: 1.5 },
      { id: 4, number: '2980', modality: 'Lotinha', date: '2026-05-23', status: 'closed', results: '04-12-25-33-41-48-52-60-71-88' }
    ]));
  }

  if (!localStorage.getItem('inovaloto_draws')) {
    localStorage.setItem('inovaloto_draws', JSON.stringify([
      { id: 1, date: '2026-05-24', time: '14:00', status: 'completed', results: '05-18-22-34-45-56-62-78-83-91' },
      { id: 2, date: '2026-05-24', time: '19:00', status: 'scheduled', results: '' },
      { id: 3, date: '2026-05-25', time: '14:00', status: 'scheduled', results: '' }
    ]));
  }

  if (!localStorage.getItem('inovaloto_tickets')) {
    localStorage.setItem('inovaloto_tickets', JSON.stringify([
      { id: 'TKT-991204', player_name: 'Roberto Silva', seller_name: 'Douglas Consultor', date: '2026-05-24 10:15', contest_number: '2981', modality: 'Lotinha', dozens: '05-12-19-24-33-48-51-66-72-89', amount: 10.00, potential_prize: 500.00, status: 'pending' },
      { id: 'TKT-991205', player_name: 'Amanda Souza', seller_name: 'Lucas Vendas', date: '2026-05-24 11:30', contest_number: '1042', modality: 'Seninha', dozens: '03-15-27-39-51-63', amount: 5.00, potential_prize: 3000.00, status: 'pending' }
    ]));
  }

  if (!localStorage.getItem('inovaloto_transactions')) {
    localStorage.setItem('inovaloto_transactions', JSON.stringify([
      { id: 1, type: 'credit', amount: 100.00, description: 'Recarga de saldo por Pix', date: '2026-05-24 09:00', user: 'Roberto Silva' },
      { id: 2, type: 'debit', amount: 10.00, description: 'Compra bilhete TKT-991204', date: '2026-05-24 10:15', user: 'Roberto Silva' },
      { id: 3, type: 'credit', amount: 50.00, description: 'Bônus de indicação', date: '2026-05-24 11:00', user: 'Amanda Souza' }
    ]));
  }

  if (!localStorage.getItem('inovaloto_closures')) {
    localStorage.setItem('inovaloto_closures', JSON.stringify([
      { id: 1, date: '2026-05-23', seller: 'Douglas Consultor', initial_cash: 50.00, sales: 480.00, commissions: 96.00, balance: 384.00, status: 'approved' },
      { id: 2, date: '2026-05-24', seller: 'Douglas Consultor', initial_cash: 100.00, sales: 150.00, commissions: 30.00, balance: 120.00, status: 'pending' }
    ]));
  }
};

initMockDB();

export const api = {
  // Authentication methods
  checkUsername: async (username) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin@inovaloto.com') {
          resolve({ exists: true, tenant: 'Inova Loto', role: 'admin' });
        } else if (username === 'seller@inovaloto.com') {
          resolve({ exists: true, tenant: 'Imperio da Sorte', role: 'seller' });
        } else {
          resolve({ exists: false });
        }
      }, 500);
    });
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('API connection failed, falling back to mock login');
    }
    
    // Mock login fallback
    if (email === 'admin@inovaloto.com' && password === 'admin123') {
      return {
        token: 'mock-jwt-admin-token',
        user: { name: 'Admin Geral', email, role: 'admin' },
        tenant: { name: 'Inova Loto', subdomain: 'inova' }
      };
    } else if (email === 'seller@inovaloto.com' && password === 'seller123') {
      return {
        token: 'mock-jwt-seller-token',
        user: { name: 'Douglas Consultor', email, role: 'seller' },
        tenant: { name: 'Imperio da Sorte', subdomain: 'imperio' }
      };
    }
    throw new Error('Credenciais inválidas ou serviço indisponível.');
  },

  // Sellers (Vendedores) API
  getSellers: async () => {
    try {
      const response = await fetch(`${API_URL}/vendedores`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore and use mock */ }
    return JSON.parse(localStorage.getItem('inovaloto_sellers'));
  },

  saveSeller: async (seller) => {
    try {
      const response = await fetch(`${API_URL}/vendedores` + (seller.id ? `/${seller.id}` : ''), {
        method: seller.id ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}`
        },
        body: JSON.stringify(seller)
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore and use mock */ }

    const sellers = JSON.parse(localStorage.getItem('inovaloto_sellers'));
    if (seller.id) {
      const idx = sellers.findIndex(s => s.id === seller.id);
      sellers[idx] = { ...sellers[idx], ...seller };
    } else {
      seller.id = Date.now();
      seller.status = 'active';
      sellers.push(seller);
    }
    localStorage.setItem('inovaloto_sellers', JSON.stringify(sellers));
    return seller;
  },

  deleteSeller: async (id) => {
    try {
      await fetch(`${API_URL}/vendedores/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
    } catch (e) { /* ignore */ }
    const sellers = JSON.parse(localStorage.getItem('inovaloto_sellers'));
    localStorage.setItem('inovaloto_sellers', JSON.stringify(sellers.filter(s => s.id !== id)));
  },

  // Players (Apostadores) API
  getPlayers: async () => {
    try {
      const response = await fetch(`${API_URL}/apostadores`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore and use mock */ }
    return JSON.parse(localStorage.getItem('inovaloto_players'));
  },

  savePlayer: async (player) => {
    try {
      const response = await fetch(`${API_URL}/apostadores` + (player.id ? `/${player.id}` : ''), {
        method: player.id ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}`
        },
        body: JSON.stringify(player)
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore and use mock */ }

    const players = JSON.parse(localStorage.getItem('inovaloto_players'));
    if (player.id) {
      const idx = players.findIndex(p => p.id === player.id);
      players[idx] = { ...players[idx], ...player };
    } else {
      player.id = Date.now();
      player.balance = player.balance || 0.00;
      player.status = 'active';
      players.push(player);
    }
    localStorage.setItem('inovaloto_players', JSON.stringify(players));
    return player;
  },

  adjustBalance: async (playerId, amount, type) => {
    try {
      const response = await fetch(`${API_URL}/apostadores/${playerId}/balance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}`
        },
        body: JSON.stringify({ amount, type })
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore and use mock */ }

    const players = JSON.parse(localStorage.getItem('inovaloto_players'));
    const idx = players.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      const floatAmount = parseFloat(amount);
      if (type === 'credit') {
        players[idx].balance += floatAmount;
      } else {
        players[idx].balance = Math.max(0, players[idx].balance - floatAmount);
      }
      localStorage.setItem('inovaloto_players', JSON.stringify(players));
      
      // Log transaction
      const transactions = JSON.parse(localStorage.getItem('inovaloto_transactions'));
      transactions.unshift({
        id: Date.now(),
        type,
        amount: floatAmount,
        description: `Ajuste manual de saldo (${type === 'credit' ? 'Adicionado' : 'Removido'})`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: players[idx].name
      });
      localStorage.setItem('inovaloto_transactions', JSON.stringify(transactions));
    }
    return players[idx];
  },

  // Contests (Concursos) & Betting Cart API
  getContests: async () => {
    try {
      const response = await fetch(`${API_URL}/concursos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore and use mock */ }
    return JSON.parse(localStorage.getItem('inovaloto_contests'));
  },

  submitBets: async (betData) => {
    try {
      const response = await fetch(`${API_URL}/concursos/apostar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}`
        },
        body: JSON.stringify(betData)
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore and use mock */ }

    // Mock cart processing
    const tickets = JSON.parse(localStorage.getItem('inovaloto_tickets'));
    const createdTickets = [];
    
    betData.bets.forEach(bet => {
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const newTkt = {
        id: ticketId,
        player_name: betData.player_name || 'Apostador Anônimo',
        seller_name: localStorage.getItem('inovaloto_user_name') || 'Douglas Consultor',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        contest_number: bet.contest_number,
        modality: bet.modality,
        dozens: bet.dozens.join('-'),
        amount: parseFloat(bet.amount),
        potential_prize: parseFloat(bet.amount) * (bet.modality === 'Lotinha' ? 50 : 600),
        status: 'pending'
      };
      tickets.unshift(newTkt);
      createdTickets.push(newTkt);
      
      // Deduct balance if player matches
      const players = JSON.parse(localStorage.getItem('inovaloto_players'));
      const pIdx = players.findIndex(p => p.name === betData.player_name);
      if (pIdx !== -1) {
        players[pIdx].balance = Math.max(0, players[pIdx].balance - newTkt.amount);
        localStorage.setItem('inovaloto_players', JSON.stringify(players));
      }
    });

    localStorage.setItem('inovaloto_tickets', JSON.stringify(tickets));
    return { success: true, tickets: createdTickets };
  },

  getTickets: async () => {
    return JSON.parse(localStorage.getItem('inovaloto_tickets'));
  },

  // Lottery Draws (Sorteios) API
  getDraws: async () => {
    try {
      const response = await fetch(`${API_URL}/sorteios`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) { /* ignore */ }
    return JSON.parse(localStorage.getItem('inovaloto_draws'));
  },

  saveDraw: async (draw) => {
    const draws = JSON.parse(localStorage.getItem('inovaloto_draws'));
    draw.id = Date.now();
    draw.status = 'scheduled';
    draw.results = '';
    draws.unshift(draw);
    localStorage.setItem('inovaloto_draws', JSON.stringify(draws));
    return draw;
  },

  runConferencia: async (drawId, winningNumbers) => {
    const draws = JSON.parse(localStorage.getItem('inovaloto_draws'));
    const dIdx = draws.findIndex(d => d.id === drawId);
    if (dIdx !== -1) {
      draws[dIdx].status = 'completed';
      draws[dIdx].results = winningNumbers;
      localStorage.setItem('inovaloto_draws', JSON.stringify(draws));
      
      // Process winners dynamically
      const tickets = JSON.parse(localStorage.getItem('inovaloto_tickets'));
      const winningArr = winningNumbers.split('-');
      
      tickets.forEach((t, index) => {
        const ticketDozens = t.dozens.split('-');
        // check match counts
        const matches = ticketDozens.filter(d => winningArr.includes(d)).length;
        
        // simple winning rules for demonstration
        if (t.modality === 'Lotinha' && matches >= 8) {
          tickets[index].status = 'won';
        } else if (t.modality === 'Seninha' && matches === 6) {
          tickets[index].status = 'won';
        } else {
          tickets[index].status = 'lost';
        }
      });
      
      localStorage.setItem('inovaloto_tickets', JSON.stringify(tickets));
    }
    return { success: true };
  },

  // Wallet & Financial Closure (Acerto de contas)
  getTransactions: async () => {
    return JSON.parse(localStorage.getItem('inovaloto_transactions'));
  },

  getClosures: async () => {
    return JSON.parse(localStorage.getItem('inovaloto_closures'));
  },

  saveClosure: async (closure) => {
    const closures = JSON.parse(localStorage.getItem('inovaloto_closures'));
    closure.id = Date.now();
    closure.seller = localStorage.getItem('inovaloto_user_name') || 'Douglas Consultor';
    closure.status = 'pending';
    closures.unshift(closure);
    localStorage.setItem('inovaloto_closures', JSON.stringify(closures));
    return closure;
  },

  approveClosure: async (id) => {
    const closures = JSON.parse(localStorage.getItem('inovaloto_closures'));
    const idx = closures.findIndex(c => c.id === id);
    if (idx !== -1) {
      closures[idx].status = 'approved';
      localStorage.setItem('inovaloto_closures', JSON.stringify(closures));
    }
  },

  // Sorteios — Modalities & One-Click
  getModalidades: async () => {
    try {
      const response = await fetch(`${API_URL}/sorteios/modalidades`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) { /* fallback */ }
    // Mock fallback: return generic modalities so the screen isn't empty
    return [
      { uuid: 'mock-lotofacil', nome: 'Lotofácil', icone: '/assets/images/logo/icon.png' },
      { uuid: 'mock-quina',     nome: 'Quina',     icone: '/assets/images/logo/icon.png' },
      { uuid: 'mock-megasena',  nome: 'Mega-Sena', icone: '/assets/images/logo/icon.png' },
    ];
  },

  getModalityData: async (modalidadeUuid) => {
    try {
      const response = await fetch(`${API_URL}/sorteios/get-modality-data/${modalidadeUuid}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) { /* fallback */ }
    // Mock: return a plausible next draw datetime (tomorrow at 14:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    const fmt = (d) => d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    return {
      success: true,
      concurso: Math.floor(1000 + Math.random() * 9000),
      data_sorteio: fmt(tomorrow),
      data_limite_aposta: null,
      data_limite_excluir_aposta: null,
    };
  },

  saveOneClickSorteio: async (payload) => {
    try {
      const response = await fetch(`${API_URL}/sorteios/one-click/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}`
        },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (response.ok) return json;
      return { success: false, error: json.error || 'Erro ao salvar sorteio.' };
    } catch (e) {
      // Mock success for offline testing
      return { success: true, message: 'Sorteio(s) gerado(s) com sucesso! (mock)' };
    }
  },

  getMapaRisco: async (dateRange = '', risco = '', modalidadeUuid = '', page = 1) => {
    try {
      let url = `${API_URL}/mapa-risco`;
      if (modalidadeUuid) {
        url += `/${modalidadeUuid}`;
      }
      const params = new URLSearchParams();
      if (dateRange) params.set('dateRange', dateRange);
      if (risco) params.set('risco', risco);
      if (page > 1) params.set('page', page);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn('API error in getMapaRisco, returning mock data', e);
    }
    // Mock fallback
    return {
      success: true,
      modalidades: [
        { uuid: 'mock-lotofacil', nome: 'Lotofácil', icone: '/assets/images/logo/icon.png' },
        { uuid: 'mock-quina', nome: 'Quina', icone: '/assets/images/logo/icon.png' }
      ],
      mapa_risco: {
        data: [
          { modalidade_id: 1, modalidade_uuid: 'mock-lotofacil', modalidade_nome: 'Lotofácil', modalidade_icone: '/assets/images/logo/icon.png', qtd_dezenas: 15, qtd_vendas: 4, valor_vendido: 100.00, valor_premiado: 0.00, val_comissao: 20.00, lucro: 80.00 },
          { modalidade_id: 2, modalidade_uuid: 'mock-quina', modalidade_nome: 'Quina', modalidade_icone: '/assets/images/logo/icon.png', qtd_dezenas: 5, qtd_vendas: 2, valor_vendido: 50.00, valor_premiado: 100.00, val_comissao: 10.00, lucro: -60.00 }
        ],
        current_page: 1,
        last_page: 1,
        total: 2
      },
      resumo: {
        valor_vendido: 150.00,
        valor_premiado: 100.00,
        val_comissao: 30.00,
        qtd_vendas: 6
      },
      saldoLiquido: 20.00
    };
  },

  getAnaliseConsultores: async (dateRange = '', ordem = '', modalidadeId = '', page = 1) => {
    try {
      let url = `${API_URL}/analise-consultores`;
      const params = new URLSearchParams();
      if (dateRange) params.set('dateRange', dateRange);
      if (ordem) params.set('ordem', ordem);
      if (modalidadeId) params.set('modalidade_id', modalidadeId);
      if (page > 1) params.set('page', page);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn('API error in getAnaliseConsultores, returning mock data', e);
    }
    // Mock fallback
    return {
      success: true,
      saldoLiquido: 120.00,
      resumo: {
        total_vendido: 450.00,
        total_premiado: 250.00,
        total_comissao: 80.00,
        qtd_lucro: 4,
        qtd_prejuizo: 1
      },
      modalidades: [
        { id: 1, nome: 'Lotofácil' },
        { id: 2, nome: 'Quina' }
      ],
      analise: {
        data: [
          { id: 1, uuid: 'mock-seller-uuid-1', name: 'Douglas Consultor', username: 'douglas', total_vendido: 250.00, total_premiado: 50.00, total_comissao: 50.00, qtd_bilhetes: 3, lucro: 150.00, qtd_lucro: 2, qtd_prejuizo: 1 },
          { id: 2, uuid: 'mock-seller-uuid-2', name: 'Maria Consultora', username: 'maria', total_vendido: 200.00, total_premiado: 200.00, total_comissao: 30.00, qtd_bilhetes: 2, lucro: -30.00, qtd_lucro: 1, qtd_prejuizo: 1 }
        ],
        current_page: 1,
        last_page: 1,
        total: 2
      }
    };
  },

  getAnaliseConsultorDetails: async (uuid, dateRange = '', modalidadeId = '') => {
    try {
      let url = `${API_URL}/analise-consultores/details/${uuid}`;
      const params = new URLSearchParams();
      if (dateRange) params.set('dateRange', dateRange);
      if (modalidadeId) params.set('modalidade_id', modalidadeId);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn('API error in getAnaliseConsultorDetails, returning mock data', e);
    }
    // Mock fallback
    return {
      detalhes_modalidades: [
        {
          nome: 'Lotofácil',
          icone: '/assets/images/logo/icon.png',
          vendas: 150.00,
          premios: 0.00,
          comissoes: 30.00,
          lucro: 120.00,
          qtd_vendas: 2,
          dezenas: [
            { dezena: '15 dezenas', qtd: 2, vendas: 150.00, premios: 0.00, comissao: 30.00, liq_banca: 120.00 }
          ]
        }
      ],
      premios_detalhados: [],
      vendas_detalhadas: [
        { qtd_dezenas: 15, valor: 120.00, modalidade: 'Lotofácil', data: '25/05/2026', qtd_bilhetes: 2 }
      ],
      total_premios: 0.00,
      total_vendas: 120.00,
      count_premios: 0,
      count_vendas: 2
    };
  },

  // Dashboard API
  getDashboard: async (type = 'summary', dateRange = '') => {
    try {
      const response = await fetch(`${API_URL}/dashboard?type=${type}&dateRange=${encodeURIComponent(dateRange)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('inovaloto_token')}` }
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn('API connection failed, falling back to mock dashboard');
    }
    
    // Mock fallbacks for offline testing/development
    const tickets = JSON.parse(localStorage.getItem('inovaloto_tickets') || '[]');
    const sellers = JSON.parse(localStorage.getItem('inovaloto_sellers') || '[]');
    const players = JSON.parse(localStorage.getItem('inovaloto_players') || '[]');
    const closures = JSON.parse(localStorage.getItem('inovaloto_closures') || '[]');

    let filteredTickets = [...tickets];
    if (dateRange && dateRange !== 'undefined') {
      try {
        const parts = dateRange.split(' até ');
        const start = parts[0];
        const end = parts[1] || start;
        filteredTickets = tickets.filter(t => {
          const tDate = t.date.substring(0, 10);
          return tDate >= start && tDate <= end;
        });
      } catch (e) {}
    } else {
      const today = new Date().toISOString().substring(0, 10);
      filteredTickets = tickets.filter(t => t.date.substring(0, 10) === today);
    }

    const valTotalApostado = filteredTickets.reduce((acc, curr) => acc + curr.amount, 0);
    const wonTickets = filteredTickets.filter(t => t.status === 'won');
    const valTotalPremiacao = wonTickets.reduce((acc, curr) => acc + curr.potential_prize, 0);
    const valTotalComissoes = filteredTickets.reduce((acc, curr) => acc + (curr.amount * 0.20), 0);
    const saldoLiquido = valTotalApostado - (valTotalComissoes + valTotalPremiacao);

    if (type === 'summary') {
      const saldoApostadores = players.reduce((acc, curr) => acc + (curr.balance || 0), 0);
      const val = closures.reduce((acc, curr) => acc + curr.sales - (curr.commissions + (curr.premiations || 0)), 0);
      const initialVal = closures.reduce((acc, curr) => acc + curr.initial_cash, 0);
      const saldoVendedores = initialVal + val;

      const formatBRL = (val) => 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      return {
        totalBilhetes: filteredTickets.length,
        valTotalApostado,
        valTotalPremiacao,
        valTotalComissoes,
        saldoApostadores,
        saldoVendedores,
        saldoLiquido,
        formatted: {
          valTotalApostado: formatBRL(valTotalApostado),
          valTotalPremiacao: formatBRL(valTotalPremiacao),
          valTotalComissoes: formatBRL(valTotalComissoes),
          saldoVendedores: formatBRL(saldoVendedores),
          saldoApostadores: formatBRL(saldoApostadores),
          saldoLiquido: formatBRL(saldoLiquido),
        }
      };
    }

    if (type === 'creditosVendedores') {
      return sellers.map(s => {
        const sellerClosures = closures.filter(c => c.seller === s.name);
        const sales = sellerClosures.reduce((acc, curr) => acc + curr.sales, 0);
        const commissions = sellerClosures.reduce((acc, curr) => acc + curr.commissions, 0);
        const initial = sellerClosures.reduce((acc, curr) => acc + curr.initial_cash, 0);
        const saldo = initial + (sales - commissions);
        return {
          name: s.name,
          saldo: saldo,
          formatted_saldo: 'R$ ' + saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        };
      });
    }

    if (type === 'creditosApostadores') {
      return players.filter(p => p.balance > 0).map(p => ({
        name: p.name,
        saldo: p.balance,
        formatted_saldo: 'R$ ' + p.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }));
    }

    if (type === 'bilhetes') {
      const groups = {};
      filteredTickets.forEach(t => {
        if (!groups[t.modality]) {
          groups[t.modality] = [];
        }
        groups[t.modality].push(t);
      });
      return Object.keys(groups).map(mod => {
        const items = groups[mod];
        return {
          modalidade_nome: mod,
          modalidade_icone: 'icon.png',
          total_bilhetes: items.length,
          bilhetes_normais: items.filter(t => !t.is_surpresinha && !t.is_importe).length,
          bilhetes_surpresinha: items.filter(t => t.is_surpresinha).length,
          bilhetes_importados: items.filter(t => t.is_importe).length,
        };
      });
    }

    if (type === 'extratoBanca') {
      const groups = {};
      filteredTickets.forEach(t => {
        if (!groups[t.modality]) {
          groups[t.modality] = [];
        }
        groups[t.modality].push(t);
      });
      const apostas = Object.keys(groups).map(mod => {
        const items = groups[mod];
        const sum = items.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          modalidade_nome: mod,
          modalidade_icone: 'icon.png',
          val_apostado: sum,
          formatted_val_apostado: 'R$ ' + sum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        };
      });

      const sellersGroup = {};
      filteredTickets.forEach(t => {
        if (!sellersGroup[t.seller_name]) {
          sellersGroup[t.seller_name] = [];
        }
        sellersGroup[t.seller_name].push(t);
      });
      const comissoes = Object.keys(sellersGroup).map(name => {
        const items = sellersGroup[name];
        const sum = items.reduce((acc, curr) => acc + (curr.amount * 0.20), 0);
        return {
          vendedor_name: name,
          comissao: sum,
          formatted_comissao: 'R$ ' + sum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        };
      });

      return { apostas, comissoes };
    }

    if (type === 'extratoVendedor') {
      return sellers.map(s => {
        const sellerTkts = filteredTickets.filter(t => t.seller_name === s.name);
        const vendas = sellerTkts.reduce((acc, curr) => acc + curr.amount, 0);
        const comissao_venda = sellerTkts.reduce((acc, curr) => acc + (curr.amount * (s.commission / 100)), 0);
        const comissao_bonus = 0;
        const premiacao = sellerTkts.filter(t => t.status === 'won').reduce((acc, curr) => acc + curr.potential_prize, 0);
        const saldo = vendas - comissao_venda - comissao_bonus - premiacao;

        return {
          vendedor_name: s.name,
          vendedor_uuid: `seller-uuid-${s.id}`,
          vendas,
          comissao_venda,
          comissao_bonus,
          premiacao,
          saldo,
          bilhetes_count: sellerTkts.length,
          surpresinha_count: sellerTkts.filter(t => t.is_surpresinha).length,
          imported_count: sellerTkts.filter(t => t.is_importe).length,
          t1: vendas - comissao_venda,
          t2: vendas - comissao_venda - comissao_bonus,
          t3: vendas - comissao_venda - comissao_bonus - premiacao,
          fechamento_url: '#'
        };
      });
    }

    return null;
  }
};
