import './globals.css';

export const metadata = {
  title: 'PCS Collection',
  description: 'Catálogo de photocards K-pop',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
