'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SolicitarPage() {
  const router = useRouter();
  const [grupo, setGrupo] = useState('');
  const [integrante, setIntegrante] = useState('');
  const [album, setAlbum] = useState('');
  const [edicionTexto, setEdicionTexto] = useState('');
  const [comentario, setComentario] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    if (!archivo) {
      setError('Por favor selecciona una foto.');
      setEnviando(false);
      return;
    }

    const nombreArchivo = `${session.user.id}-${Date.now()}-${archivo.name}`;

    const { error: errorSubida } = await supabase.storage
      .from('solicitudes')
      .upload(nombreArchivo, archivo);

    if (errorSubida) {
      setError('No pudimos subir la foto: ' + errorSubida.message);
      setEnviando(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('solicitudes').getPublicUrl(nombreArchivo);

    const { error: errorInsert } = await supabase.from('solicitudes').insert({
      grupo_texto: grupo,
      integrante_texto: integrante,
      album_texto: album,
      edicion_texto: edicionTexto,
      comentario,
      foto_url: urlData.publicUrl,
      estado: 'pendiente',
      usuario_id: session.user.id,
    });

    if (errorInsert) {
      setError('No pudimos guardar la solicitud: ' + errorInsert.message);
      setEnviando(false);
      return;
    }

    setEnviado(true);
    setEnviando(false);
  }

  if (enviado) {
    return (
      <main className="page">
        <header className="page-header">
          <span className="eyebrow">PCS Collection</span>
          <h1>¡Gracias!</h1>
        </header>
        <p className="status">
          Tu solicitud quedó guardada como "pendiente de revisión". La vamos a revisar pronto y
          agregarla al catálogo si corresponde.
        </p>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <span className="eyebrow">PCS Collection</span>
        <h1>Solicitar carta faltante</h1>
      </header>

      <form onSubmit={manejarSubmit} className="auth-form">
        <label className="auth-label">
          Grupo
          <input
            type="text"
            required
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            className="auth-input"
            placeholder="Ej: SEVENTEEN"
          />
        </label>

        <label className="auth-label">
          Integrante
          <input
            type="text"
            required
            value={integrante}
            onChange={(e) => setIntegrante(e.target.value)}
            className="auth-input"
            placeholder="Ej: Jeonghan"
          />
        </label>

        <label className="auth-label">
          Álbum
          <input
            type="text"
            required
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            className="auth-input"
            placeholder="Ej: FML"
          />
        </label>

        <label className="auth-label">
          Edición / versión
          <input
            type="text"
            required
            value={edicionTexto}
            onChange={(e) => setEdicionTexto(e.target.value)}
            className="auth-input"
            placeholder="Ej: CARAT Ver. / Photobook Ver. A"
          />
        </label>

        <label className="auth-label">
          Foto de la carta
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setArchivo(e.target.files[0])}
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          Comentario (opcional)
          <input
            type="text"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="auth-input"
            placeholder="Cualquier detalle extra"
          />
        </label>

        {error && <p className="status status-error">{error}</p>}

        <button type="submit" disabled={enviando} className="auth-submit">
          {enviando ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </main>
  );
}
