import "./globals.css";

export const metadata = {
  applicationName: "ANGEN Free Image Studio",
  title: "ANGEN — Free Image Studio",
  description: "No-key free image generator with semantic categories, smart source rotation, and lightweight 3D UI.",
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
