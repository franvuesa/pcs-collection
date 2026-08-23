'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function NavBar() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">PCS Collection</Link>
      <div className="navbar-actions">
        {!cargando && sesion && (
          <>
            <span className="navbar-email">{sesion.user.email}</span>
            <button className="navbar-btn" onClick={cerrarSesion}>Cerrar sesión</button>
          </>
        )}
        {!cargando && !sesion && (
          <Link href="/login" className="navbar-btn">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  );
}
