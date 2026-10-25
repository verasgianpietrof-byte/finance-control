import './globals.css';

export const metadata = {
  title: 'Finance Control',
  description: 'Controle financeiro pessoal simples e visual',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}