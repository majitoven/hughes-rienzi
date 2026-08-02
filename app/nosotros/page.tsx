import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import Footer from "@/components/Footer";

export default function Nosotros() {
  return (
    <main style={{ background: "#fff" }}>
      {/* Hero */}
      <section style={{ position: "relative", width: "100%", aspectRatio: "1440 / 700" }}>
        <Image src="/images/nosotros/hero.png" alt="Sobre Nosotros" fill priority style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 100%)" }} />
        <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FadeIn>
            <h1 className="hr-nosotros-hero-title" style={{ fontFamily: "var(--font)", fontWeight: 600, fontSize: 70, lineHeight: "64px", color: "#fff", textAlign: "center" }}>
              Sobre Nosotros
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Intro two-column */}
      <section className="hr-section" style={{ padding: "96px 79px", maxWidth: 1440, margin: "0 auto" }}>
        <div className="hr-nosotros-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <FadeIn direction="right">
            <h2 className="hr-nosotros-title" style={{ fontFamily: "var(--font)", fontWeight: 500, fontSize: 50, lineHeight: "63px", marginBottom: 24 }}>
              En Grupo Hughes &amp; Rienzi trabajamos hace más de 20 años en proyectos inmobiliarios.
            </h2>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 24, lineHeight: "28px", color: "var(--text-muted)" }}>
              Adelantándonos a las tendencias del mercado. La visión de nuestros fundadores abrió los horizontes en la zona de Carrasco Este, siendo{" "}
              <strong style={{ color: "var(--black)", fontWeight: 600 }}>Grupo Hughes &amp; Rienzi pionero en los desarrollos de la zona.</strong>
            </p>
          </FadeIn>
          <FadeIn direction="left" delay={0.1} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 24, lineHeight: "28px", color: "var(--text-muted)" }}>
              A través de nuestros emprendimientos fuimos re-imaginando e interpretando las nuevas formas de vivir con el confort de lo tradicional, adaptado a las necesidades de la vida contemporánea.
            </p>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 24, lineHeight: "28px", color: "var(--text-muted)" }}>
              En nuestra génesis se fusiona la arquitectura con el asesoramiento integral en inversiones inmobiliarias. Dos visiones complementarias del desarrollo en real estate; por un lado, la creación y el proyecto arquitectónico, y por otro, los aspectos comerciales y financieros de los emprendimientos.
            </p>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 24, lineHeight: "28px", color: "var(--text-muted)" }}>
              En base a una visión única y un profundo conocimiento de las preferencias y valores de nuestros clientes, construimos no sólo posibilidades de inversión, construimos nuevas oportunidades.
            </p>
          </FadeIn>
        </div>

        {/* Quote card */}
        <FadeIn>
          <div className="hr-quote-card" style={{ background: "var(--gray)", borderRadius: 24, padding: 16, marginTop: 64, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 131, alignItems: "center" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "585 / 414", borderRadius: 57, overflow: "hidden" }}>
              <Image src="/images/nosotros/equipo.jpg" alt="Equipo Grupo Hughes & Rienzi" fill style={{ objectFit: "cover" }} />
            </div>
            <p style={{ fontFamily: "var(--font)", fontWeight: 500, fontSize: 28, lineHeight: "36px", color: "var(--black)" }}>
              Frase del equipo tipo &ldquo;quote&rdquo;
            </p>
          </div>
        </FadeIn>
      </section>

      <Footer minimal />

      <style>{`
        @media (max-width: 900px) {
          .hr-nosotros-hero-title { font-size: 32px !important; }
          .hr-nosotros-title { font-size: 30px !important; line-height: 36px !important; }
          .hr-nosotros-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hr-nosotros-grid p { font-size: 16px !important; line-height: 24px !important; }
          .hr-quote-card { grid-template-columns: 1fr !important; gap: 20px !important; padding: 16px !important; border-radius: 16px !important; }
        }
      `}</style>
    </main>
  );
}
