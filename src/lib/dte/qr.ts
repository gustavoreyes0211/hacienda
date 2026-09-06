import QRCode from 'qrcode';

export interface QRParams {
  ambiente: '00' | '01';
  codigoGeneracion: string;
  fechaEmision: string; // YYYY-MM-DD
}

/**
 * Genera la URL pública de consulta de DTE del Ministerio de Hacienda de El Salvador
 * Esta URL es la que obligatoriamente debe codificarse en el Código QR según la normativa técnica.
 */
export function getHaciendaConsultaPublicaUrl({ ambiente, codigoGeneracion, fechaEmision }: QRParams): string {
  const baseUrl = 'https://admin.factura.gob.sv/consultaPublica';
  const params = new URLSearchParams({
    ambiente,
    codGen: codigoGeneracion.toUpperCase(),
    fechaEmi: fechaEmision
  });
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Genera la imagen del Código QR en formato base64 Data URL (PNG) para mostrar en pantalla o incrustar en el PDF
 */
export async function generateDteQRCodeDataUrl(params: QRParams): Promise<string> {
  const url = getHaciendaConsultaPublicaUrl(params);
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generando QR de Hacienda:', error);
    // Fallback simple si hay algún problema
    return '';
  }
}
