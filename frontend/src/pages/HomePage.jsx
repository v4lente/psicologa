import { useEffect, useState } from "react";
import { publicApi } from "../api/publicApi";
import { BookingCalendar } from "../components/BookingCalendar";
import { FeaturedContent } from "../components/FeaturedContent";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";

export function HomePage() {
  const [contents, setContents] = useState([]);

  useEffect(() => {
    document.title = "Thais Coletto | Psicologa";
    let active = true;
    async function load() {
      try {
        const data = await publicApi.getContents();
        if (!active) return;
        setContents(data);
      } catch {
        if (!active) return;
        setContents([]);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <Header />
      <main>
        <Hero />
        <BookingCalendar />
        <FeaturedContent contents={contents} />
      </main>
      <Footer />
    </div>
  );
}
