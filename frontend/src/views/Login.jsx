import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = username, 2 = password
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [userRole, setUserRole] = useState('');

  // Add the custom auth CSS exactly as it was in auth/template.blade.php
  const authStyles = `
    /* Modern Inputs */
    .auth-form-control {
        padding: 12px 15px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
        border-radius: 10px !important;
        transition: all 0.3s ease !important;
        width: 100%;
    }

    .auth-form-control:focus {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: #655afc !important;
        box-shadow: 0 0 0 0.25rem rgba(101, 90, 252, 0.25) !important;
        outline: none;
    }

    .auth-form-control::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
    }

    /* Animated Gradient Background */
    body {
        min-height: 100vh;
        background: linear-gradient(-45deg, #0f0c29, #302b63, #655afc, #24243e) !important;
        background-size: 400% 400% !important;
        animation: gradientBG 15s ease infinite !important;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* Glassmorphism Card */
    .auth-card-wrapper {
        padding: 40px !important;
        width: 400px;
        background: rgba(15, 15, 25, 0.6) !important;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
        border-radius: 24px !important;
        margin: 0 auto;
    }

    /* Premium Buttons */
    .auth-btn-primary {
        background: linear-gradient(90deg, #655afc, #8c82ff) !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 12px !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px;
        transition: all 0.3s ease !important;
        color: #fff !important;
        width: 100%;
        cursor: pointer;
    }

    .auth-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(101, 90, 252, 0.4) !important;
    }

    .auth-btn-secondary {
        background: rgba(255,255,255,0.1) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        color: #fff !important;
        border-radius: 10px !important;
        padding: 12px !important;
        font-weight: 600 !important;
        cursor: pointer;
        transition: all 0.3s ease !important;
    }

    .auth-btn-secondary:hover {
        background: rgba(255,255,255,0.15) !important;
    }

    /* Icons adjustment */
    .input-icon-left span i,
    .pass-icon i {
        color: rgba(255, 255, 255, 0.7) !important;
    }

    .authentication-top h5,
    .authentication-top h6 {
        color: #fff !important;
        font-weight: 600;
        margin-bottom: 25px !important;
    }
    
    .from__input-box span {
        position: absolute;
        left: 15px;
        top: 15px;
        z-index: 10;
    }

    .from__input-box input {
        padding-left: 45px !important;
    }
    
    .from__input-box {
        position: relative;
        margin-bottom: 15px;
    }
  `;

  useEffect(() => {
    // We don't need to manually set body styles because the injected <style> handles it via CSS
    return () => {
      // Revert any changes if necessary when unmounting
      document.body.style = '';
    };
  }, []);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username) {
        throw new Error('Informe o usuário');
      }
      
      const res = await api.checkUsername(username);
      if (res.exists) {
        setTenantName(res.tenant);
        setUserRole(res.role);
        setStep(2);
      } else {
        setError('Usuário não encontrado.');
      }
    } catch (err) {
      setError(err.message || 'Erro ao validar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.login(username, password);
      if (res.token) {
        onLoginSuccess({ name: username, role: res.role });
      }
    } catch (err) {
      setError(err.message || 'Credenciais inválidas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-xxl w-100" style={{ maxWidth: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      
      <div className="w-100 d-flex align-items-center justify-content-center">
        <div className="auth-card-wrapper">
          <div className="text-center">
            <img src="/assets/images/logo/inovalogo.png" className="mx-auto" width="250" alt="InovaLoto Logo" />
          </div>

          <div className="authentication-top text-center mt-3">
            <h6 className="mb-15">Efetuar Login</h6>
          </div>

          {error && (
            <div className="alert alert-danger inverse alert-dismissible fade show mb-3" role="alert">
              <i className="icon-xmark-large me-2"></i>
              <span className="mb-0">{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleUsernameSubmit}>
              <div className="from__input-box input-icon-left">
                <div className="form__input">
                  <input 
                    className="auth-form-control" 
                    name="username" 
                    type="text" 
                    placeholder="Seu Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <span><i className="icon-user"></i></span>
                </div>
              </div>
              <div className="mt-3">
                <button 
                  className="auth-btn-primary" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Próximo'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div className="text-center mb-4 text-white">
                <small className="text-muted d-block mb-1">Olá, {username}</small>
                {tenantName && <span className="badge bg-primary bg-opacity-25 border border-primary text-white rounded-pill px-3 py-1">{tenantName}</span>}
              </div>

              <div className="from__input-box input-icon-left">
                <div className="form__input">
                  <input 
                    className="auth-form-control" 
                    name="password" 
                    type="password" 
                    placeholder="Sua Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span><i className="icon-lock"></i></span>
                </div>
              </div>
              <div className="mt-4 d-flex gap-2">
                <button 
                  className="auth-btn-secondary w-50" 
                  type="button" 
                  onClick={() => { setStep(1); setPassword(''); setError(''); }}
                  disabled={isLoading}
                >
                  Voltar
                </button>
                <button 
                  className="auth-btn-primary w-50" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
