'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function GruposPage() {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarGrupos() {
      const { data, error } = await supabase.from('grupos').select('*');
      if (error) {
        setError(error.message);
      } else {
        setGrupos(data);
      }
      setCargando(false);
    }
    cargarGrupos();
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">PCS Collection</span>
        <h1>Elige tu grupo</h1>
      </header>

      {cargando && <p className="status">Cargando grupos…</p>}

      {error && (
        <p className="status status-error">
          Hubo un problema conectando con la base de datos: {error}
        </p>
      )}

      {!cargando && !error && grupos.length === 0 && (
        <p className="status">Todavía no hay grupos cargados en la base de datos.</p>
      )}

      <div className="grid">
        {grupos.map((grupo) => (
          <Link key={grupo.id} href={`/grupo/${grupo.id}`} className="card">
            <span className="card-glow" aria-hidden="true"></span>
            <span className="card-label">{grupo.nombre}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
