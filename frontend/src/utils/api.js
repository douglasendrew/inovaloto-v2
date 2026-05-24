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
  }
};
