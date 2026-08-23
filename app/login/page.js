'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function manejarSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    if (modo === 'registro') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    }
    setCargando(false);
  }

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">PCS Collection</span>
        <h1>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
      </header>

      <form onSubmit={manejarSubmit} className="auth-form">
        <label className="auth-label">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
        </label>

        {error && <p className="status status-error">{error}</p>}

        <button type="submit" disabled={cargando} className="auth-submit">
          {cargando ? 'Un momento…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <button
        className="auth-switch"
        onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
      >
        {modo === 'login' ? '¿No tienes cuenta? Créala aquí' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </main>
  );
}
