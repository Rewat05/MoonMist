import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Moon, Sparkles } from "lucide-react";

const slides = [
  {
    title: "Soft, breathable fabrics",
    text: "Handpicked materials that feel gentle on your skin, perfect for long cozy nights.",
  },
  {
    title: "Designed for slow evenings",
    text: "Relaxed fits, elegant silhouettes – made for reading, streaming, and unwinding.",
  },
  {
    title: "Luxury without the noise",
    text: "Minimal, modern, and timeless nightwear that quietly speaks premium.",
  },
];

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // change slide every 5s
    return () => clearInterval(id);
  }, []);

  return (
    <main className="bg-[#f0f2f3] min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#029fae] bg-white/70 px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4" />
              luxury nightwear
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#272343] leading-tight">
              Wrap your nights in{" "}
              <span className="text-[#029fae]">MoonMist</span> comfort.
            </h1>
            <p className="text-sm md:text-base text-[#636270] max-w-md">
              Discover premium, minimal nightwear crafted for slow evenings,
              gentle mornings, and everything in between.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#029fae] text-white text-sm font-medium shadow-sm hover:bg-[#01808c] transition-colors"
              >
                Shop nightwear
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-[#636270]">
                <Star className="w-4 h-4 text-[#f5b400]" />
                <span>Comfort-first · Minimal · Premium feel</span>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl shadow-lg overflow-hidden">
              <img
                src="https://res.cloudinary.com/dh0a6vbts/image/upload/v1765038044/logo_picture_moonmist_v2edys.png"
                alt="MoonMist nightwear hero"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Auto-moving slides / highlights */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-[#272343]">
              Why you&apos;ll love MoonMist
            </h3>
            <div className="hidden sm:flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === activeSlide ? "w-5 bg-[#029fae]" : "bg-[#d0d2d5]"
                  }`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${activeSlide * 100}%)`,
                }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="min-w-full px-0 md:px-4 flex justify-center"
                  >
                    <div className="w-full md:w-4/5 lg:w-3/4 bg-white rounded-2xl shadow-sm border border-[#e1e3e5] p-6 md:p-7">
                      <p className="text-sm font-medium text-[#272343] mb-2">
                        {slide.title}
                      </p>
                      <p className="text-sm text-[#636270]">{slide.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* mobile dots below */}
            <div className="flex sm:hidden justify-center mt-4 gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === activeSlide ? "w-5 bg-[#029fae]" : "bg-[#d0d2d5]"
                  }`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* About / brand section */}
        <section className="bg-white rounded-3xl border border-[#e1e3e5] p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-semibold text-[#272343]">
              A luxury nightwear brand for slow, beautiful nights.
            </h3>
            <p className="text-sm text-[#636270] max-w-3xl">
              MoonMist is built around one simple idea: your nights deserve as
              much intention as your days. We craft elevated, minimal nightwear
              that feels soft, looks refined, and fits into your everyday
              rituals – from Netflix marathons to late-night journaling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-[#272343]">Thoughtful fabrics</p>
              <p className="text-[#636270]">
                Breathable, gentle, and chosen for all-night comfort so you wake
                up feeling rested, not restricted.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-[#272343]">
                Elevated, minimal design
              </p>
              <p className="text-[#636270]">
                Clean lines, calm colors, and silhouettes that feel special
                without trying too hard.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-[#272343]">
                Made for real routines
              </p>
              <p className="text-[#636270]">
                Nightwear that works for movie nights, sleepovers, late
                deadlines, and lazy Sundays alike.
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* footer note */}
      <footer className="border-t border-[#e1e3e5] bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-[11px] text-center tracking-wide text-[#636270] uppercase">
            made by rewat raj tomar
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Home;

{
  /* <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#272343] via-[#3c325b] to-[#029fae] shadow-lg overflow-hidden flex items-end p-6">
              <div className="space-y-2 text-white max-w-xs">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                  <Moon className="w-4 h-4 text-[#8ff0ff]" />
                  night in, lights low
                </p>
                <h2 className="text-xl font-semibold">
                  Nightwear that feels like a soft exhale.
                </h2>
                <p className="text-xs text-white/80">
                  Pair your favorite playlist with fabrics that move the way you
                  do – slow, easy, and unbothered.
                </p>
              </div>
            </div>
          </div> */
}
