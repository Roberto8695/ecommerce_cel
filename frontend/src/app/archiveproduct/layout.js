import HeaderComponent from "@/components/Header/HeaderComponent";
import FooterComponent from "@/components/Footer/FooterComponent";

export default function ProductLayout({ children }) {
  return (
    <div className="min-h-screen bg-white-force product-page-container">
      <HeaderComponent />
      <main className="bg-white">
        {children}
      </main>
      <FooterComponent />
    </div>
  );
}
