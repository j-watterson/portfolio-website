import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jonathon-watterson-portfolio.sites.openai.com"),
  title: { default: "Jon Watterson — Data Engineer", template: "%s | Jon Watterson" },
  description: "Data engineering portfolio featuring production-minded ETL, BigQuery warehouse, dbt, and Airflow systems.",
  keywords: ["data engineer", "Python", "SQL", "BigQuery", "dbt", "Airflow", "data platform"],
  authors: [{ name: "Jon Watterson", url: "https://www.jwatterson.com/" }],
  openGraph: {
    title: "Jon Watterson — Data Engineering Portfolio",
    description: "Reliable pipelines, cloud data systems, and analytics infrastructure.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1110" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jon Watterson",
    url: "https://www.jwatterson.com/",
    jobTitle: "Data Engineer",
    sameAs: ["https://github.com/j-watterson", "https://www.linkedin.com/in/jw-data/"],
    knowsAbout: ["Data Engineering", "Python", "SQL", "BigQuery", "dbt", "Apache Airflow"],
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
