import type { Metadata } from "next";
import "../styles/index.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Camp Compass",
  description: "Camp Compass Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
