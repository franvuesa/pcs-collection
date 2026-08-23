'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabaseClient';

export default function AlbumesPage() {
  const params = useParams();
  const grupoId = params.id;
  const integranteId = params.integranteId;

  const [integrante, setIntegrante] = useState(null);
  const [albumes, setAlbumes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data: integranteData, error: errorIntegrante } = await supabase
        .from('integrantes')
        .select('*')
        .eq('id', integranteId)
        .single();

      const { data: albumesData, error: errorAlbumes } = await supabase
        .from('albumes')
        .select('*')
        .eq('grupo_id', grupoId);

      if (errorIntegrante || errorAlbumes) {
        setError((errorIntegrante || errorAlbumes).message);
      } else {
        setIntegrante(integranteData);
        setAlbumes(albumesData);
      }
      setCargando(false);
    }
    cargarDatos();
  }, [grupoId, integranteId]);

  return (
    <main className="page">
      <Link href={`/grupo/${grupoId}`} className="back-link">← Integrantes</Link>

      <header className="page-header">
        <span className="eyebrow">{integrante ? integrante.nombre : 'PCS Collection'}</span>
        <h1>Elige el álbum</h1>
      </header>

      {cargando && <p className="status">Cargando álbumes…</p>}

      {error && (
        <p className="status status-error">
          Hubo un problema conectando con la base de datos: {error}
        </p>
      )}

      {!cargando && !error && albumes.length === 0 && (
        <p className="status">Todavía no hay álbumes cargados para este grupo.</p>
      )}

      <div className="grid">
        {albumes.map((album) => (
          <Link
            key={album.id}
            href={`/grupo/${grupoId}/integrante/${integranteId}/album/${album.id}`}
            className="card"
          >
            <span className="card-glow" aria-hidden="true"></span>
            <span className="card-label">{album.nombre}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
