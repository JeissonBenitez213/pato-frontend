import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

export const metadata: Metadata = {
  title: "Pato",
  description: "Red social de proyectos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
