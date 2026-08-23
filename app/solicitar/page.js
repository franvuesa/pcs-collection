'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function CampoConOpciones({
  label,
  opciones,
  valor,
  onValorChange,
  nuevo,
  onNuevoChange,
  soloTexto,
  placeholderNuevo,
  permitirNuevo = true,
  notaExtra,
}) {
  if (soloTexto) {
    return (
      <label className="auth-label">
        {label}
        <input
          type="text"
          required
          value={nuevo}
          onChange={(e) => onNuevoChange(e.target.value)}
          className="auth-input"
          placeholder={placeholderNuevo}
        />
      </label>
    );
  }

  return (
    <label className="auth-label">
      {label}
      <select
        required
        value={valor}
        onChange={(e) => onValorChange(e.target.value)}
        className="auth-input"
      >
        <option value="">Selecciona…</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
        {permitirNuevo && <option value="nuevo">+ Agregar nuevo…</option>}
      </select>
      {valor === 'nuevo' && permitirNuevo && (
        <input
          type="text"
          required
          value={nuevo}
          onChange={(e) => onNuevoChange(e.target.value)}
          className="auth-input"
          placeholder={placeholderNuevo}
          style={{ marginTop: 8 }}
        />
      )}
      {notaExtra && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{notaExtra}</span>}
    </label>
  );
}

export default function SolicitarPage() {
  const router = useRouter();

  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState('');
  const [grupoNuevo, setGrupoNuevo] = useState('');

  const [integrantes, setIntegrantes] = useState([]);
  const [integranteId, setIntegranteId] = useState('');
  const [integranteNuevo, setIntegranteNuevo] = useState('');

  const [albumes, setAlbumes] = useState([]);
  const [albumId, setAlbumId] = useState('');
  const [albumNuevo, setAlbumNuevo] = useState('');

  const [ediciones, setEdiciones] = useState([]);
  const [edicionId, setEdicionId] = useState('');
  const [edicionNuevo, setEdicionNuevo] = useState('');

  const [comentario, setComentario] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    supabase
      .from('grupos')
      .select('id, nombre, integrantes_completos')
      .order('nombre')
      .then(({ data }) => setGrupos(data || []));
  }, []);

  useEffect(() => {
    setIntegranteId('');
    setIntegranteNuevo('');
    setIntegrantes([]);
    setAlbumId('');
    setAlbumNuevo('');
    setAlbumes([]);
    setEdicionId('');
    setEdicionNuevo('');
    setEdiciones([]);

    if (grupoId && grupoId !== 'nuevo') {
      supabase
        .from('integrantes')
        .select('id, nombre')
        .eq('grupo_id', grupoId)
        .order('nombre')
        .then(({ data }) => setIntegrantes(data || []));

      supabase
        .from('albumes')
        .select('id, nombre')
        .eq('grupo_id', grupoId)
        .order('nombre')
        .then(({ data }) => setAlbumes(data || []));
    }
  }, [grupoId]);

  useEffect(() => {
    setEdicionId('');
    setEdicionNuevo('');
    setEdiciones([]);

    if (albumId && albumId !== 'nuevo') {
      supabase
        .from('ediciones')
        .select('id, nombre')
        .eq('album_id', albumId)
        .order('nombre')
        .then(({ data }) => setEdiciones(data || []));
    }
  }, [albumId]);

  const grupoSeleccionado = grupos.find((g) => String(g.id) === grupoId);
  const integrantesCompletos = grupoSeleccionado ? grupoSeleccionado.integrantes_completos : false;

  const integranteSoloTexto = grupoId === '' || grupoId === 'nuevo';
  const albumSoloTexto = grupoId === '' || grupoId === 'nuevo';
  const edicionSoloTexto = albumSoloTexto || albumId === '' || albumId === 'nuevo';

  function textoFinal(soloTexto, valorId, nuevoTexto, opciones) {
    if (soloTexto || valorId === 'nuevo') return nuevoTexto.trim();
    const encontrado = opciones.find((o) => String(o.id) === valorId);
    return encontrado ? encontrado.nombre : '';
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const grupoTexto = textoFinal(false, grupoId, grupoNuevo, grupos);
    const integranteTexto = textoFinal(integranteSoloTexto, integranteId, integranteNuevo, integrantes);
    const albumTexto = textoFinal(albumSoloTexto, albumId, albumNuevo, albumes);
    const edicionTexto = textoFinal(edicionSoloTexto, edicionId, edicionNuevo, ediciones);

    if (!grupoTexto || !integranteTexto || !albumTexto || !edicionTexto) {
      setError('Por favor completa Grupo, Integrante, Álbum y Edición.');
      setEnviando(false);
      return;
    }

    if (integrantesCompletos && integranteId === 'nuevo') {
      setError('Este grupo ya tiene todos sus integrantes cargados. Elige uno de la lista.');
      setEnviando(false);
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
      grupo_texto: grupoTexto,
      integrante_texto: integranteTexto,
      album_texto: albumTexto,
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
        <CampoConOpciones
          label="Grupo"
          opciones={grupos}
          valor={grupoId}
          onValorChange={setGrupoId}
          nuevo={grupoNuevo}
          onNuevoChange={setGrupoNuevo}
          soloTexto={false}
          placeholderNuevo="Nombre del grupo nuevo"
        />

        <CampoConOpciones
          label="Integrante"
          opciones={integrantes}
          valor={integranteId}
          onValorChange={setIntegranteId}
          nuevo={integranteNuevo}
          onNuevoChange={setIntegranteNuevo}
          soloTexto={integranteSoloTexto}
          placeholderNuevo="Nombre del integrante"
          permitirNuevo={!integrantesCompletos}
          notaExtra={
            integrantesCompletos ? 'Este grupo ya tiene todos sus integrantes cargados.' : null
          }
        />

        <CampoConOpciones
          label="Álbum"
          opciones={albumes}
          valor={albumId}
          onValorChange={setAlbumId}
          nuevo={albumNuevo}
          onNuevoChange={setAlbumNuevo}
          soloTexto={albumSoloTexto}
          placeholderNuevo="Nombre del álbum"
        />

        <CampoConOpciones
          label="Edición / versión"
          opciones={ediciones}
          valor={edicionId}
          onValorChange={setEdicionId}
          nuevo={edicionNuevo}
          onNuevoChange={setEdicionNuevo}
          soloTexto={edicionSoloTexto}
          placeholderNuevo="Ej: CARAT Ver. / Photobook Ver. A"
        />

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
