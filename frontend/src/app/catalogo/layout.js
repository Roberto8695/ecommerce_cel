import HeaderComponent from "@/components/Header/HeaderComponent";
import FooterComponent from "@/components/Footer/FooterComponent";

export default function CatalogoLayout({ children }) {
  return (
    <>
      <HeaderComponent />
      <main>
        {children}
      </main>
      <FooterComponent />
    </>
  );
}
