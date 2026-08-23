'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ADMIN_EMAIL = 'fransotom.fs@gmail.com';

export default function AdminPage() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [solicitudes, setSolicitudes] = useState([]);
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession();
      setSesion(session);

      if (session && session.user.email === ADMIN_EMAIL) {
        const { data } = await supabase
          .from('solicitudes')
          .select('*')
          .eq('estado', 'pendiente')
          .order('created_at', { ascending: true });
        setSolicitudes(data || []);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  // Busca una fila por nombre en la tabla indicada; si no existe, la crea.
  async function buscarOCrear(tabla, columnaNombre, nombre, filtrosExtra = {}) {
    let query = supabase.from(tabla).select('id').ilike(columnaNombre, nombre.trim());
    Object.entries(filtrosExtra).forEach(([campo, valor]) => {
      query = query.eq(campo, valor);
    });
    const { data: existentes } = await query;
    if (existentes && existentes.length > 0) {
      return existentes[0].id;
    }
    const { data: nuevo, error } = await supabase
      .from(tabla)
      .insert({ [columnaNombre]: nombre.trim(), ...filtrosExtra })
      .select('id')
      .single();
    if (error) throw error;
    return nuevo.id;
  }

  async function aprobar(solicitud) {
    setProcesando(solicitud.id);
    try {
      const grupoId = await buscarOCrear('grupos', 'nombre', solicitud.grupo_texto);
      const integranteId = await buscarOCrear('integrantes', 'nombre', solicitud.integrante_texto, {
        grupo_id: grupoId,
      });
      const albumId = await buscarOCrear('albumes', 'nombre', solicitud.album_texto, {
        grupo_id: grupoId,
      });
      const edicionId = await buscarOCrear('ediciones', 'nombre', solicitud.edicion_texto, {
        album_id: albumId,
      });

      const { error: errorCarta } = await supabase.from('photocards').insert({
        foto_url: solicitud.foto_url,
        edicion_id: edicionId,
        integrante_id: integranteId,
        estado: 'aprobada',
      });
      if (errorCarta) throw errorCarta;

      await supabase.from('solicitudes').update({ estado: 'aprobada' }).eq('id', solicitud.id);

      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id));
    } catch (err) {
      alert('Hubo un problema al aprobar: ' + err.message);
    }
    setProcesando(null);
  }

  async function rechazar(solicitud) {
    setProcesando(solicitud.id);
    const { error } = await supabase
      .from('solicitudes')
      .update({ estado: 'rechazada' })
      .eq('id', solicitud.id);

    if (error) {
      alert('Hubo un problema: ' + error.message);
    } else {
      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id));
    }
    setProcesando(null);
  }

  if (cargando) {
    return (
      <main className="page">
        <p className="status">Cargando…</p>
      </main>
    );
  }

  if (!sesion || sesion.user.email !== ADMIN_EMAIL) {
    return (
      <main className="page">
        <header className="page-header">
          <span className="eyebrow">PCS Collection</span>
          <h1>Acceso restringido</h1>
        </header>
        <p className="status">Esta pantalla es solo para la administradora del catálogo.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">PCS Collection</span>
        <h1>Solicitudes pendientes</h1>
      </header>

      {solicitudes.length === 0 && (
        <p className="status">No hay solicitudes pendientes por ahora.</p>
      )}

      <div className="photocard-grid">
        {solicitudes.map((solicitud) => (
          <div key={solicitud.id} className="photocard-card">
            {solicitud.foto_url && (
              <img src={solicitud.foto_url} alt="Solicitud" className="photocard-image" />
            )}
            <div className="photocard-info">
              <p className="photocard-context">
                {solicitud.grupo_texto} · {solicitud.integrante_texto}
                <br />
                {solicitud.album_texto} — {solicitud.edicion_texto}
                {solicitud.comentario && (
                  <>
                    <br />"{solicitud.comentario}"
                  </>
                )}
              </p>
              <div className="photocard-actions">
                <button
                  className="photocard-btn have"
                  disabled={procesando === solicitud.id}
                  onClick={() => aprobar(solicitud)}
                >
                  ✓ Aprobar
                </button>
                <button
                  className="photocard-btn trade"
                  disabled={procesando === solicitud.id}
                  onClick={() => rechazar(solicitud)}
                >
                  ✕ Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
