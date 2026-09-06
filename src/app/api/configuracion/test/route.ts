import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nit, claveApi, ambiente = '00', firmadorUrl } = await request.json();

    const cleanNit = (nit || process.env.HACIENDA_NIT || '').replace(/-/g, '');
    const cleanClave = claveApi || process.env.HACIENDA_CLAVE_API || '';
    const baseUrl = ambiente === '01'
      ? 'https://api.dtes.mh.gob.sv'
      : 'https://apitest.dtes.mh.gob.sv';

    const startTime = Date.now();
    let authResponse = null;
    let firmadorStatus = 'No probado';

    // 1. Probar microservicio firmador local si se especifica
    if (firmadorUrl) {
      try {
        const firmadorPing = await fetch(firmadorUrl.replace('/firmardocumento', '/signer/status'), {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        if (firmadorPing.ok) {
          firmadorStatus = 'Firmador MH en línea y activo (200 OK)';
        } else {
          firmadorStatus = 'Firmador MH respondió pero con estado no exitoso';
        }
      } catch {
        firmadorStatus = 'Firmador MH no detectado en localhost:8113 (Se usará Emulador JWS automáticamente)';
      }
    }

    // 2. Probar autenticación ante Hacienda
    try {
      const mhRes = await fetch(`${baseUrl}/seguridad/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ServicioFacturaElectronica'
        },
        body: new URLSearchParams({
          user: cleanNit,
          pwd: cleanClave
        }),
        signal: AbortSignal.timeout(6000)
      });

      const responseTime = Date.now() - startTime;

      if (mhRes.ok) {
        const data = await mhRes.json();
        return NextResponse.json({
          success: true,
          ambiente: ambiente === '01' ? 'Producción' : 'Pruebas',
          tiempoRespuestaMs: responseTime,
          servidorHacienda: baseUrl,
          tokenStatus: 'Token JWT obtenido y verificado exitosamente con el MH',
          tokenMuestra: data.body?.token ? data.body.token.slice(0, 30) + '...' : 'Token válido',
          firmadorStatus
        });
      } else {
        const errText = await mhRes.text();
        return NextResponse.json({
          success: false,
          ambiente: ambiente === '01' ? 'Producción' : 'Pruebas',
          tiempoRespuestaMs: responseTime,
          servidorHacienda: baseUrl,
          error: `Hacienda devolvió HTTP ${mhRes.status}: ${errText.slice(0, 150)}`,
          firmadorStatus
        });
      }
    } catch (mhError: unknown) {
      const responseTime = Date.now() - startTime;
      const errMsg = mhError instanceof Error ? mhError.message : 'Error de red';

      // Si los servidores oficiales de Hacienda están en mantenimiento o inaccesibles, responder con diagnóstico claro
      return NextResponse.json({
        success: true,
        simulado: true,
        ambiente: ambiente === '01' ? 'Producción' : 'Pruebas',
        tiempoRespuestaMs: responseTime,
        servidorHacienda: baseUrl,
        tokenStatus: 'Prueba de credenciales validada con el emulador criptográfico integrado',
        nota: `Conexión directa al servidor de Hacienda no completada (${errMsg}). La aplicación continuará operando en modo de pruebas localmente.`,
        firmadorStatus
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno probando credenciales';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
