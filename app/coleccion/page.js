'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const ETIQUETAS = {
  tengo: 'Tengo',
  busco: 'Busco',
  intercambio: 'Para Intercambio',
};

export default function MiColeccionPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filas, setFilas] = useState([]);

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('coleccion')
        .select(
          `estado, photocard_id,
           photocards (
             id, foto_url,
             integrantes ( nombre ),
             ediciones (
               nombre,
               albumes (
                 nombre,
                 grupos ( nombre )
               )
             )
           )`
        )
        .eq('usuario_id', session.user.id);

      if (error) {
        setError(error.message);
      } else {
        setFilas(data);
      }
      setCargando(false);
    }
    cargar();
  }, [router]);

  const grupos = { tengo: [], busco: [], intercambio: [] };
  filas.forEach((fila) => {
    if (grupos[fila.estado]) {
      grupos[fila.estado].push(fila);
    }
  });

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">PCS Collection</span>
        <h1>Mi colección</h1>
      </header>

      {cargando && <p className="status">Cargando tu colección…</p>}

      {error && (
        <p className="status status-error">
          Hubo un problema conectando con la base de datos: {error}
        </p>
      )}

      {!cargando && !error && filas.length === 0 && (
        <p className="status">
          Todavía no marcaste ninguna carta. Anda al catálogo y marca algunas.
        </p>
      )}

      {['tengo', 'busco', 'intercambio'].map((estado) =>
        grupos[estado].length > 0 ? (
          <section key={estado}>
            <h2 className="version-heading">{ETIQUETAS[estado]}</h2>
            <div className="photocard-grid">
              {grupos[estado].map((fila) => {
                const carta = fila.photocards;
                if (!carta) return null;
                const integrante = carta.integrantes ? carta.integrantes.nombre : '';
                const edicion = carta.ediciones ? carta.ediciones.nombre : '';
                const album =
                  carta.ediciones && carta.ediciones.albumes ? carta.ediciones.albumes.nombre : '';
                const grupo =
                  carta.ediciones && carta.ediciones.albumes && carta.ediciones.albumes.grupos
                    ? carta.ediciones.albumes.grupos.nombre
                    : '';
                return (
                  <div key={carta.id} className="photocard-card">
                    {carta.foto_url && (
                      <img src={carta.foto_url} alt={integrante} className="photocard-image" />
                    )}
                    <div className="photocard-info">
                      <p className="photocard-context">
                        {grupo} · {integrante}
                        <br />
                        {album} — {edicion}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null
      )}
    </main>
  );
}
