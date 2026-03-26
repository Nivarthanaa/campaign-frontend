import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "Campaign Optimization System (Segmentation + Prediction)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <h1>Campaign Optimization System (Segmentation + Prediction)</h1>
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
