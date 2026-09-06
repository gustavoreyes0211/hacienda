// Generador oficial de JSON para Documentos Tributarios Electrónicos (DTE)
// Cumple con la normativa técnica del Ministerio de Hacienda de El Salvador

import { v4 as uuidv4 } from 'uuid';
import {
  DTEJsonDocumento,
  DTEEmisor,
  DTEReceptor,
  DTECuerpoDocumentoItem,
  DTEResumen,
  TipoDTE,
  Ambiente
} from './types';

// Convertidor de números a letras en español para el campo oficial totalLetras
export function numeroALetras(monto: number): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);
  const strCentavos = `${centavos.toString().padStart(2, '0')}/100 USD`;

  if (entero === 0) return `CERO DÓLARES CON ${strCentavos}`;
  if (entero === 100) return `CIEN DÓLARES CON ${strCentavos}`;

  function convertirSeccion(n: number): string {
    let output = '';
    if (n === 100) return 'CIEN';
    if (n > 99) {
      output += centenas[Math.floor(n / 100)] + ' ';
      n = n % 100;
    }
    if (n >= 10 && n <= 19) {
      output += especiales[n - 10] + ' ';
      return output.trim();
    }
    if (n >= 20 && n <= 29) {
      if (n === 20) return (output + 'VEINTE').trim();
      return (output + 'VEINTI' + unidades[n % 10]).trim();
    }
    if (n > 29) {
      output += decenas[Math.floor(n / 10)];
      if (n % 10 !== 0) output += ' Y ' + unidades[n % 10];
      return output.trim();
    }
    if (n > 0) {
      output += unidades[n];
    }
    return output.trim();
  }

  let letras = '';
  if (entero >= 1000) {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    if (miles === 1) letras += 'MIL ';
    else letras += convertirSeccion(miles) + ' MIL ';
    if (resto > 0) letras += convertirSeccion(resto) + ' ';
  } else {
    letras = convertirSeccion(entero) + ' ';
  }

  const sufijoDolares = entero === 1 ? 'DÓLAR' : 'DÓLARES';
  return `${letras.trim()} ${sufijoDolares} CON ${strCentavos}`;
}

export interface EmisionParams {
  tipoDte: TipoDTE;
  ambiente?: Ambiente;
  correlativo: number;
  emisor: DTEEmisor;
  receptor: DTEReceptor;
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    precioUni: number;
    esGravado?: boolean;
  }>;
  metodoPago?: '01' | '02' | '03'; // 01: Efectivo, 02: Tarjeta (Stripe), 03: Transferencia
  referenciaPago?: string;
  observaciones?: string;
}

/**
 * Construye el JSON estandarizado oficial para el Ministerio de Hacienda
 */
export function generarJsonDTE(params: EmisionParams): DTEJsonDocumento {
  const ambiente = params.ambiente || '00';
  const version = params.tipoDte === '01' ? 1 : 3;

  // Formato oficial del Número de Control: DTE-{tipoDte}-{codEstablecimiento}{codPuntoVenta}-{correlativo a 15 dígitos}
  const codEstablecimiento = params.emisor.codEstablecimientoMH || 'M001';
  const codPuntoVenta = params.emisor.codPuntoVentaMH || 'P001';
  const correlativoStr = params.correlativo.toString().padStart(15, '0');
  const numeroControl = `DTE-${params.tipoDte}-${codEstablecimiento}${codPuntoVenta}-${correlativoStr}`;

  // Código de Generación: UUID v4 en MAYÚSCULAS
  const codigoGeneracion = uuidv4().toUpperCase();

  const now = new Date();
  const fecEmi = now.toISOString().split('T')[0];
  const horEmi = now.toTimeString().split(' ')[0];

  let totalGravada = 0;
  let totalExenta = 0;

  const cuerpoDocumento: DTECuerpoDocumentoItem[] = params.items.map((item, index) => {
    const esGravado = item.esGravado !== false;
    const subtotal = Number((item.cantidad * item.precioUni).toFixed(2));

    if (esGravado) {
      totalGravada += subtotal;
    } else {
      totalExenta += subtotal;
    }

    const itemDte: DTECuerpoDocumentoItem = {
      numItem: index + 1,
      tipoItem: 1, // 1: Bien, 2: Servicio
      cantidad: item.cantidad,
      codigo: item.codigo,
      uniMedida: 59, // 59: Unidad según catálogo MH
      descripcion: item.descripcion,
      precioUni: item.precioUni,
      montoDescu: 0,
      ventaNoSuj: 0,
      ventaExenta: esGravado ? 0 : subtotal,
      ventaGravada: esGravado ? subtotal : 0,
      tributos: esGravado ? ['20'] : null // "20" es código oficial de IVA 13% en MH
    };

    // Si es Crédito Fiscal (03), se desglosa el IVA por ítem
    if (params.tipoDte === '03' && esGravado) {
      itemDte.ivaItem = Number((subtotal * 0.13).toFixed(2));
    }

    return itemDte;
  });

  totalGravada = Number(totalGravada.toFixed(2));
  totalExenta = Number(totalExenta.toFixed(2));
  const subTotalVentas = Number((totalGravada + totalExenta).toFixed(2));

  // Cálculo del IVA:
  // Para Factura (01), los precios al consumidor ya incluyen IVA, por lo que se calcula IVA contenido para efectos fiscales.
  // Para Crédito Fiscal (03), el IVA (13%) se suma sobre el valor neto gravado.
  let ivaCalculado = 0;
  let totalPagar = 0;

  if (params.tipoDte === '01') {
    // Factura Consumidor Final: El total a pagar es el monto con IVA incluido
    totalPagar = subTotalVentas;
    ivaCalculado = Number((totalGravada - (totalGravada / 1.13)).toFixed(2));
  } else {
    // Crédito Fiscal: Total = Subtotal + 13% de IVA
    ivaCalculado = Number((totalGravada * 0.13).toFixed(2));
    totalPagar = Number((subTotalVentas + ivaCalculado).toFixed(2));
  }

  const resumen: DTEResumen = {
    totalNoSuj: 0,
    totalExenta: totalExenta,
    totalGravada: totalGravada,
    subTotalVentas: subTotalVentas,
    descuNoSuj: 0,
    descuExenta: 0,
    descuGravada: 0,
    porcentajeDescuento: 0,
    totalDescu: 0,
    subTotal: subTotalVentas,
    montoTotalOperacion: totalPagar,
    totalNoGravado: 0,
    totalPagar: totalPagar,
    totalLetras: numeroALetras(totalPagar),
    condicionOperacion: 1, // 1: Contado
    pagos: [
      {
        codigo: params.metodoPago || '01',
        montoPago: totalPagar,
        referencia: params.referenciaPago || null
      }
    ]
  };

  if (params.tipoDte === '01') {
    resumen.totalIva = ivaCalculado;
  } else {
    resumen.tributos = [
      {
        codigo: '20',
        descripcion: 'Impuesto al Valor Agregado 13%',
        valor: ivaCalculado
      }
    ];
  }

  return {
    identificacion: {
      version,
      ambiente,
      tipoDte: params.tipoDte,
      numeroControl,
      codigoGeneracion,
      tipoModelo: 1, // Previo
      tipoOperacion: 1, // Normal
      fecEmi,
      horEmi,
      tipoMoneda: 'USD'
    },
    emisor: params.emisor,
    receptor: params.receptor,
    cuerpoDocumento,
    resumen,
    extension: {
      observaciones: params.observaciones || 'Emitido automáticamente por Sistema de Tienda'
    }
  };
}
