import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { firmadorUrl = 'http://localhost:8113' } = await request.json().catch(() => ({}));

  // Normalizar la URL base (quitar /firmardocumento si viene incluido)
  const baseUrl = firmadorUrl.replace('/firmardocumento', '').replace(/\/$/, '');

  const resultado: {
    online: boolean;
    statusEndpoint: string;
    firmadorVersion?: string;
    mensaje?: string;
    error?: string;
    tiempoRespuestaMs: number;
    modoFallback: string;
  } = {
    online: false,
    statusEndpoint: `${baseUrl}/signer/status`,
    tiempoRespuestaMs: 0,
    modoFallback: 'Emulador Criptográfico JWS SHA-512 (Node.js integrado)'
  };

  const start = Date.now();

  try {
    // 1. Verificar endpoint de status oficial del firmador MH
    const statusRes = await fetch(`${baseUrl}/signer/status`, {
      method: 'GET',
      headers: { 'User-Agent': 'ServicioFacturaElectronica' },
      signal: AbortSignal.timeout(3000)
    });

    resultado.tiempoRespuestaMs = Date.now() - start;

    if (statusRes.ok) {
      const text = await statusRes.text();
      resultado.online = true;
      resultado.mensaje = text.includes('running')
        ? 'Firmador MH activo y listo para firmar documentos DTE'
        : text.slice(0, 80);
    } else {
      resultado.error = `Firmador respondió HTTP ${statusRes.status}. Verifique que el servicio esté iniciado.`;
    }
  } catch (err: unknown) {
    resultado.tiempoRespuestaMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed') || msg.includes('timeout')) {
      resultado.error = `Firmador MH no detectado en ${baseUrl}. El servicio puede no estar iniciado o el puerto 8113 está bloqueado por el firewall.`;
    } else {
      resultado.error = msg;
    }
  }

  // 2. También probar el endpoint de firmado real (ping)
  try {
    const pingRes = await fetch(`${baseUrl}/firmardocumento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'ServicioFacturaElectronica' },
      body: JSON.stringify({ ping: true }),
      signal: AbortSignal.timeout(2000)
    });

    if (pingRes.status === 400 || pingRes.status === 200) {
      // El endpoint existe (aunque rechace un JSON vacío, responde = está corriendo)
      resultado.online = true;
      resultado.mensaje = resultado.mensaje || 'Endpoint /firmardocumento activo y respondiendo';
    }
  } catch {
    // Ignorar - si ya sabemos que no está online
  }

  return NextResponse.json(resultado);
}
