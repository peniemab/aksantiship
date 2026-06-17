import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}
