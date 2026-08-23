'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabaseClient';

export default function EdicionesPage() {
  const params = useParams();
  const grupoId = params.id;
  const integranteId = params.integranteId;
  const albumId = params.albumId;

  const [integrante, setIntegrante] = useState(null);
  const [ediciones, setEdiciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data: integranteData, error: errorIntegrante } = await supabase
        .from('integrantes')
        .select('*')
        .eq('id', integranteId)
        .single();

      const { data: edicionesData, error: errorEdiciones } = await supabase
        .from('ediciones')
        .select('*')
        .eq('album_id', albumId);

      if (errorIntegrante || errorEdiciones) {
        setError((errorIntegrante || errorEdiciones).message);
      } else {
        setIntegrante(integranteData);
        setEdiciones(edicionesData);
      }
      setCargando(false);
    }
    cargarDatos();
  }, [albumId, integranteId]);

  return (
    <main className="page">
      <Link href={`/grupo/${grupoId}/integrante/${integranteId}`} className="back-link">
        ← Álbumes
      </Link>

      <header className="page-header">
        <span className="eyebrow">{integrante ? integrante.nombre : 'PCS Collection'}</span>
        <h1>Elige la edición</h1>
      </header>

      {cargando && <p className="status">Cargando ediciones…</p>}

      {error && (
        <p className="status status-error">
          Hubo un problema conectando con la base de datos: {error}
        </p>
      )}

      {!cargando && !error && ediciones.length === 0 && (
        <p className="status">Todavía no hay ediciones cargadas para este álbum.</p>
      )}

      <div className="grid">
        {ediciones.map((edicion) => (
          <Link
            key={edicion.id}
            href={`/grupo/${grupoId}/integrante/${integranteId}/album/${albumId}/edicion/${edicion.id}`}
            className="card"
          >
            <span className="card-glow" aria-hidden="true"></span>
            <span className="card-label">{edicion.nombre}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
