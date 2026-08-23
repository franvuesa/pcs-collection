'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function IntegrantesPage() {
  const params = useParams();
  const grupoId = params.id;

  const [grupo, setGrupo] = useState(null);
  const [integrantes, setIntegrantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data: grupoData, error: errorGrupo } = await supabase
        .from('grupos')
        .select('*')
        .eq('id', grupoId)
        .single();

      const { data: integrantesData, error: errorIntegrantes } = await supabase
        .from('integrantes')
        .select('*')
        .eq('grupo_id', grupoId);

      if (errorGrupo || errorIntegrantes) {
        setError((errorGrupo || errorIntegrantes).message);
      } else {
        setGrupo(grupoData);
        setIntegrantes(integrantesData);
      }
      setCargando(false);
    }
    cargarDatos();
  }, [grupoId]);

  return (
    <main className="page">
      <Link href="/" className="back-link">← Grupos</Link>

      <header className="page-header">
        <span className="eyebrow">{grupo ? grupo.nombre : 'PCS Collection'}</span>
        <h1>Elige tu integrante</h1>
      </header>

      {cargando && <p className="status">Cargando integrantes…</p>}

      {error && (
        <p className="status status-error">
          Hubo un problema conectando con la base de datos: {error}
        </p>
      )}

      {!cargando && !error && integrantes.length === 0 && (
        <p className="status">Todavía no hay integrantes cargados para este grupo.</p>
      )}

      <div className="grid">
        {integrantes.map((integrante) => (
          <Link
            key={integrante.id}
            href={`/grupo/${grupoId}/integrante/${integrante.id}`}
            className="card"
          >
            <span className="card-glow" aria-hidden="true"></span>
            <span className="card-label">{integrante.nombre}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
