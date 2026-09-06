// Tipos oficiales para Documentos Tributarios Electrónicos (DTE) - Ministerio de Hacienda de El Salvador
// Versión estándar para Factura Electrónica (01) y Comprobante de Crédito Fiscal (03)

export type TipoDTE = '01' | '03' | '05' | '06' | '14'; // 01: Factura, 03: CCF, 05: Nota de Crédito, etc.
export type Ambiente = '00' | '01'; // 00: Pruebas / Sandbox, 01: Producción
export type TipoMoneda = 'USD';

export interface DTEIdentificacion {
  version: number;
  ambiente: Ambiente;
  tipoDte: TipoDTE;
  numeroControl: string; // Ej: DTE-01-M001P001-000000000000001
  codigoGeneracion: string; // UUID v4 en mayúsculas
  tipoModelo: number; // 1: Previo, 2: Diferido
  tipoOperacion: number; // 1: Normal, 2: Contingencia
  fecEmi: string; // YYYY-MM-DD
  horEmi: string; // HH:mm:ss
  tipoMoneda: TipoMoneda;
  tipoContingencia?: number | null;
  motivoContin?: string | null;
}

export interface DTEDireccion {
  departamento: string; // Catálogo MH (ej. "06" San Salvador)
  municipio: string;    // Catálogo MH (ej. "14" San Salvador Centro)
  complemento: string;  // Dirección exacta
}

export interface DTEEmisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string; // Código de actividad económica MH
  descActividad: string;
  nombreComercial?: string;
  tipoEstablecimiento: string; // "01": Sucursal/Agencia, "02": Casa Matriz
  direccion: DTEDireccion;
  telefono: string;
  correo: string;
  codEstablecimientoMH?: string | null; // Asignado por MH (ej. "M001")
  codPuntoVentaMH?: string | null;      // Asignado por MH (ej. "P001")
}

export interface DTEReceptor {
  tipoDocumento?: string; // "36": NIT, "13": DUI, "02": Pasaporte, "03": Carnet de residencia
  numDocumento?: string;
  nrc?: string; // Obligatorio para Crédito Fiscal (03)
  nombre: string;
  codActividad?: string; // Obligatorio para Crédito Fiscal
  descActividad?: string;
  direccion?: DTEDireccion;
  telefono?: string;
  correo: string;
}

export interface DTETributoItem {
  codigo: string; // "20": IVA 13%
  descripcion: string;
  valor: number;
}

export interface DTECuerpoDocumentoItem {
  numItem: number;
  tipoItem: number; // 1: Bien, 2: Servicio
  numeroDocumento?: string | null;
  cantidad: number;
  codigo: string; // SKU o código interno
  codTributo?: string | null;
  uniMedida: number; // 59: Unidad, etc.
  descripcion: string;
  precioUni: number;
  montoDescu: number;
  ventaNoSuj: number;
  ventaExenta: number;
  ventaGravada: number;
  tributos?: string[] | null; // ["20"] para IVA
  psv?: number;
  noGravado?: number;
  ivaItem?: number; // Para CCF desglose de IVA por ítem
}

export interface DTEPago {
  codigo: string; // "01": Billetes y monedas, "02": Tarjeta Débito/Crédito, "03": Transferencia/Depósito
  montoPago: number;
  referencia?: string | null;
  plazo?: string | null;
  periodo?: number | null;
}

export interface DTEResumen {
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  porcentajeDescuento: number;
  totalDescu: number;
  tributos?: DTETributoItem[] | null; // Para CCF desglosado
  subTotal: number;
  ivaRete1?: number;
  reteRenta?: number;
  montoTotalOperacion: number;
  totalNoGravado: number;
  totalPagar: number;
  totalLetras: string;
  totalIva?: number; // Para Factura de Consumidor Final
  saldoFavor?: number;
  condicionOperacion: number; // 1: Contado, 2: Crédito, 3: Otro
  pagos: DTEPago[];
  numPagoElectronico?: string | null;
}

export interface DTEExtension {
  nombEntrega?: string | null;
  docuEntrega?: string | null;
  nombRecibe?: string | null;
  docuRecibe?: string | null;
  observaciones?: string | null;
  placaVehiculo?: string | null;
}

export interface DTEApendiceItem {
  campo: string;
  etiqueta: string;
  valor: string;
}

export interface DTEJsonDocumento {
  identificacion: DTEIdentificacion;
  emisor: DTEEmisor;
  receptor: DTEReceptor;
  otrosDocumentos?: unknown | null;
  ventaTercero?: unknown | null;
  cuerpoDocumento: DTECuerpoDocumentoItem[];
  resumen: DTEResumen;
  extension?: DTEExtension | null;
  apendice?: DTEApendiceItem[] | null;
}

// Respuesta oficial del Ministerio de Hacienda ante /fesv/recepciondte
export interface DTERespuestaHacienda {
  version: number;
  ambiente: Ambiente;
  versionApp: number;
  estado: 'PROCESADO' | 'RECHAZADO';
  codigoGeneracion: string;
  selloRecibido: string; // Hash / Sello oficial otorgado por Hacienda
  fhProcesamiento: string; // Fecha y hora de procesamiento oficial
  clasificaMsg?: string;
  codigoMsg?: string;
  descripcionMsg?: string;
  observaciones?: string[];
}
