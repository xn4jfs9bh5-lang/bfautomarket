import "./globals.css";

export const metadata = {
  title: "BF Auto Market — Agent IA Sourcing",
  description: "Agent IA de sourcing automobile Europe/Japon vers Burkina Faso",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
