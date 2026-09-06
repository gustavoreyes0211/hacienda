import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HaciendaPOS - Sistema de Tienda con Facturación Electrónica DTE & Pagos Stripe',
  description: 'Sistema integral de Punto de Venta, inventario, emisión de DTE ante el Ministerio de Hacienda de El Salvador y pagos con Stripe.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white`}>
        {/* Glow ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <Navbar />

        <main className="flex-1 relative z-10">
          {children}
        </main>

        <footer className="relative z-10 border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} HaciendaPOS - Integración con Ministerio de Hacienda de El Salvador (factura.gob.sv)</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Ambiente de Pruebas Activo
              </span>
              <span>•</span>
              <span>Stripe Payments</span>
              <span>•</span>
              <span>JWS SHA-512 Security</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
