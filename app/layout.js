import './globals.css';
import NavBar from './components/NavBar';

export const metadata = {
  title: 'PCS Collection',
  description: 'Catálogo de photocards K-pop',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
