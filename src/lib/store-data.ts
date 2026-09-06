// Datos iniciales y catálogo de la tienda para demostración y desarrollo

export interface ProductoTienda {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  esGravado: boolean;
  categoria: string;
  imagen?: string;
}

export interface ClienteTienda {
  id: string;
  tipoDocumento: string; // 13: DUI, 36: NIT
  numDocumento: string;
  nrc?: string;
  nombre: string;
  nombreComercial?: string;
  codActividad?: string;
  descActividad?: string;
  departamento: string;
  municipio: string;
  direccion: string;
  telefono: string;
  correo: string;
  tipoCliente: 'CONSUMIDOR_FINAL' | 'CONTRIBUYENTE';
}

export const PRODUCTOS_INICIALES: ProductoTienda[] = [
  {
    id: 'prod-1',
    sku: 'LAP-001',
    nombre: 'Laptop Pro 15" Intel i7 16GB RAM',
    descripcion: 'Computadora portátil de alto rendimiento para oficina y diseño',
    precio: 850.00,
    costo: 620.00,
    stock: 12,
    stockMinimo: 3,
    esGravado: true,
    categoria: 'Tecnología'
  },
  {
    id: 'prod-2',
    sku: 'MON-027',
    nombre: 'Monitor UltraSharp 27" 4K IPS',
    descripcion: 'Monitor profesional con calibración de color y puertos USB-C',
    precio: 320.00,
    costo: 210.00,
    stock: 8,
    stockMinimo: 2,
    esGravado: true,
    categoria: 'Tecnología'
  },
  {
    id: 'prod-3',
    sku: 'TEC-003',
    nombre: 'Teclado Mecánico Inalámbrico RGB',
    descripcion: 'Switch táctil silencioso, batería recargable de larga duración',
    precio: 75.00,
    costo: 42.00,
    stock: 25,
    stockMinimo: 5,
    esGravado: true,
    categoria: 'Accesorios'
  },
  {
    id: 'prod-4',
    sku: 'CAF-500',
    nombre: 'Café de Especialidad Pacamara (500g)',
    descripcion: 'Café gourmet cultivado en Apaneca-Ilamatepec, tueste medio artesanal',
    precio: 14.50,
    costo: 8.00,
    stock: 40,
    stockMinimo: 10,
    esGravado: true,
    categoria: 'Alimentos'
  },
  {
    id: 'prod-5',
    sku: 'SRV-001',
    nombre: 'Licencia Software de Gestión Empresarial',
    descripcion: 'Suscripción anual con soporte técnico 24/7 y respaldos',
    precio: 180.00,
    costo: 50.00,
    stock: 999,
    stockMinimo: 1,
    esGravado: true,
    categoria: 'Servicios'
  },
  {
    id: 'prod-6',
    sku: 'LIB-009',
    nombre: 'Libro: Guía Tributaria de El Salvador 2026',
    descripcion: 'Manual comprensivo de leyes fiscales y facturación electrónica',
    precio: 25.00,
    costo: 12.00,
    stock: 18,
    stockMinimo: 4,
    esGravado: false, // Exento según código tributario
    categoria: 'Educación'
  }
];

export const CLIENTES_INICIALES: ClienteTienda[] = [
  {
    id: 'cli-1',
    tipoDocumento: '13', // DUI
    numDocumento: '05123456-7',
    nombre: 'Carlos Eduardo Menjívar',
    departamento: '06', // San Salvador
    municipio: '14',
    direccion: 'Colonia Escalón, Calle El Mirador #452, San Salvador',
    telefono: '7845-1234',
    correo: 'carlos.menjivar@gmail.com',
    tipoCliente: 'CONSUMIDOR_FINAL'
  },
  {
    id: 'cli-2',
    tipoDocumento: '36', // NIT
    numDocumento: '0614-250392-102-1',
    nrc: '254890-3',
    nombre: 'DISTRIBUIDORA INDUSTRIAL SALVADOREÑA S.A. DE C.V.',
    nombreComercial: 'DISALVA S.A.',
    codActividad: '46510',
    descActividad: 'Venta al por mayor de computadoras y equipo periférico',
    departamento: '06',
    municipio: '14',
    direccion: 'Boulevard Los Próceres, Edificio Torre Roble Nivel 5',
    telefono: '2288-9900',
    correo: 'cuentasporpagar@disalva.com.sv',
    tipoCliente: 'CONTRIBUYENTE'
  },
  {
    id: 'cli-3',
    tipoDocumento: '13',
    numDocumento: '04891230-1',
    nombre: 'Sofía María Rodríguez Peña',
    departamento: '05', // La Libertad
    municipio: '11',    // Santa Tecla
    direccion: 'Residencial Santa Teresa, Senda Los Pinos #12',
    telefono: '7911-2233',
    correo: 'sofia.rodriguez@hotmail.com',
    tipoCliente: 'CONSUMIDOR_FINAL'
  }
];
