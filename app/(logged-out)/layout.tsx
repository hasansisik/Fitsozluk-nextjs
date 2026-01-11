import type { Metadata } from "next";
import "../globals.css";
import { DictionaryHeader } from "@/components/dictionary-header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Fitsözlük",
  description: "Sözlük",
};

export default function LoggedOutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DictionaryHeader />
      {children}
      <Footer />
    </>
  );
}
