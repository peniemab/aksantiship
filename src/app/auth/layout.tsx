import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-surface px-4 py-12">
        <div className="w-full max-w-lg">{children}</div>
      </main>
      <Footer />
    </>
  );
}
