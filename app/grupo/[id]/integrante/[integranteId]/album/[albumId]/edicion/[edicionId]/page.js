'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../../../lib/supabaseClient';

export default function PhotocardsPage() {
  const params = useParams();
  const grupoId = params.id;
  const integranteId = params.integranteId;
  const albumId = params.albumId;
  const edicionId = params.edicionId;

  const [edicion, setEdicion] = useState(null);
  const [cartas, setCartas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data: edicionData, error: errorEdicion } = await supabase
        .from('ediciones')
        .select('*')
        .eq('id', edicionId)
        .single();

      const { data: cartasData, error: errorCartas } = await supabase
        .from('photocards')
        .select('*')
        .eq('edicion_id', edicionId)
        .eq('integrante_id', integranteId);

      if (errorEdicion || errorCartas) {
        setError((errorEdicion || errorCartas).message);
      } else {
        setEdicion(edicionData);
        setCartas(cartasData);
      }
      setCargando(false);
    }
    cargarDatos();
  }, [edicionId, integranteId]);

  async function manejarAccion(estado, cartaId) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert('Necesitas iniciar sesión para guardar tu colección.');
      window.location.href = '/login';
      return;
    }

    setGuardando(cartaId + estado);
    const usuarioId = session.user.id;

    await supabase
      .from('coleccion')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('photocard_id', cartaId);

    const { error } = await supabase.from('coleccion').insert({
      usuario_id: usuarioId,
      photocard_id: cartaId,
      estado,
    });

    setGuardando(null);

    if (error) {
      alert('Hubo un problema guardando: ' + error.message);
    } else {
      alert('¡Guardado! Marcaste esta carta como "' + estado + '".');
    }
  }

  return (
    <main className="page">
      <Link
        href={`/grupo/${grupoId}/integrante/${integranteId}/album/${albumId}`}
        className="back-link"
      >
        ← Ediciones
      </Link>

      <header className="page-header">
        <span className="eyebrow">{edicion ? edicion.nombre : 'PCS Collection'}</span>
        <h1>Photocards</h1>
      </header>

      {cargando && <p className="status">Cargando cartas…</p>}

      {error && (
        <p className="status status-error">
          Hubo un problema conectando con la base de datos: {error}
        </p>
      )}

      {!cargando && !error && cartas.length === 0 && (
        <p className="status">Todavía no hay photocards cargadas para esta edición e integrante.</p>
      )}

      <div className="photocard-grid">
        {cartas.map((carta) => (
          <div key={carta.id} className="photocard-card">
            {carta.foto_url && (
              <img src={carta.foto_url} alt={edicion ? edicion.nombre : 'Photocard'} className="photocard-image" />
            )}
            <div className="photocard-info">
              <div className="photocard-actions">
                <button
                  className="photocard-btn have"
                  disabled={guardando === carta.id + 'tengo'}
                  onClick={() => manejarAccion('tengo', carta.id)}
                >
                  + Have It
                </button>
                <button
                  className="photocard-btn wishlist"
                  disabled={guardando === carta.id + 'busco'}
                  onClick={() => manejarAccion('busco', carta.id)}
                >
                  + Wishlist
                </button>
                <button
                  className="photocard-btn trade"
                  disabled={guardando === carta.id + 'intercambio'}
                  onClick={() => manejarAccion('intercambio', carta.id)}
                >
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
