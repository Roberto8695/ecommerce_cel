import HeaderComponent from "@/components/Header/HeaderComponent";
import FooterComponent from "@/components/Footer/FooterComponent";

export default function RootLayout({ children }) {
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