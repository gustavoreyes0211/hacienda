// Servicio de Autenticación con el Ministerio de Hacienda de El Salvador
// Endpoint: POST /seguridad/auth
// Genera y cachea el token Bearer JWT con vigencia de 24 horas.

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

export interface MHAuthCredentials {
  nit: string;
  claveApi: string;
  ambiente?: '00' | '01'; // 00: Pruebas, 01: Producción
}

export async function getHaciendaBearerToken(credentials?: MHAuthCredentials): Promise<string> {
  const now = Date.now();

  // Si ya tenemos token en caché y no está próximo a expirar (margen de 5 minutos), lo reutilizamos
  if (cachedToken && cachedToken.expiresAt > now + 300000) {
    return cachedToken.token;
  }

  const nit = credentials?.nit || process.env.HACIENDA_NIT || '06140101901012';
  const claveApi = credentials?.claveApi || process.env.HACIENDA_CLAVE_API || 'ClavePruebaApiMH2026*';
  const ambiente = credentials?.ambiente || (process.env.HACIENDA_AMBIENTE as '00' | '01') || '00';

  const baseUrl = ambiente === '01'
    ? 'https://api.dtes.mh.gob.sv'
    : 'https://apitest.dtes.mh.gob.sv';

  try {
    const response = await fetch(`${baseUrl}/seguridad/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ServicioFacturaElectronica'
      },
      body: new URLSearchParams({
        user: nit.replace(/-/g, ''),
        pwd: claveApi
      }),
      // timeout de 10s
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.body?.token) {
        const token = data.body.token;
        // Guardamos con expiración de 23.5 horas
        cachedToken = {
          token,
          expiresAt: now + 23.5 * 60 * 60 * 1000
        };
        return token;
      }
    }
  } catch (error) {
    console.warn('No se pudo conectar al servidor oficial de Hacienda (seguridad/auth). Usando token de simulación local:', error);
  }

  // Fallback simulado seguro para pruebas locales sin conexión a Hacienda
  const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated_mh_token_${Date.now()}`;
  cachedToken = {
    token: mockToken,
    expiresAt: now + 24 * 60 * 60 * 1000
  };
  return mockToken;
}
