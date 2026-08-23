'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabaseClient';

export default function PhotocardsPage() {
  const params = useParams();
  const grupoId = params.id;
  const integranteId = params.integranteId;
  const albumId = params.albumId;

  const [album, setAlbum] = useState(null);
  const [cartas, setCartas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data: albumData, error: errorAlbum } = await supabase
        .from('albumes')
        .select('*')
        .eq('id', albumId)
        .single();

      const { data: cartasData, error: errorCartas } = await supabase
        .from('photocards')
        .select('*')
        .eq('album_id', albumId)
        .eq('integrante_id', integranteId);

      if (errorAlbum || errorCartas) {
        setError((errorAlbum || errorCartas).message);
      } else {
        setAlbum(albumData);
        setCartas(cartasData);
      }
      setCargando(false);
    }
    cargarDatos();
  }, [albumId, integranteId]);

  function manejarAccion(accion, carta) {
    alert(
      `Muy pronto vas a poder marcar "${carta.version}" como "${accion}".\nPrimero necesitamos construir el inicio de sesión.`
    );
  }

  return (
    <main className="page">
      <Link href={`/grupo/${grupoId}/integrante/${integranteId}`} className="back-link">
        ← Álbumes
      </Link>

      <header className="page-header">
        <span className="eyebrow">{album ? album.nombre : 'PCS Collection'}</span>
        <h1>Photocards</h1>
      </header>

      {cargando && <p className="status">Cargando cartas…</p>}

      {error && (
        <p className="status status-error">
          Hubo un problema conectando con la base de datos: {error}
        </p>
      )}

      {!cargando && !error && cartas.length === 0 && (
        <p className="status">Todavía no hay photocards cargadas para este álbum e integrante.</p>
      )}

      <div className="photocard-grid">
        {cartas.map((carta) => (
          <div key={carta.id} className="photocard-card">
            {carta.foto_url && (
              <img src={carta.foto_url} alt={carta.version} className="photocard-image" />
            )}
            <div className="photocard-info">
              <p className="photocard-version">{carta.version}</p>
              <div className="photocard-actions">
                <button className="photocard-btn have" onClick={() => manejarAccion('Tengo', carta)}>
                  + Have It
                </button>
                <button className="photocard-btn wishlist" onClick={() => manejarAccion('Busco', carta)}>
                  + Wishlist
                </button>
                <button className="photocard-btn trade" onClick={() => manejarAccion('Para Intercambio', carta)}>
                  + For Trade
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
