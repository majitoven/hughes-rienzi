import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import Footer from "@/components/Footer";

export default function Nosotros() {
  return (
    <main style={{ background: "#fff" }}>
      {/* Hero */}
      <section style={{ position: "relative", width: "100%", height: "100vh", minHeight: 560 }}>
        <Image src="/images/nosotros/hero.png" alt="Desarrollar con identidad." fill priority sizes="100vw" className="hr-nosotros-hero-img" style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 100%)" }} />
        <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FadeIn>
            <h1 className="hr-nosotros-hero-title" style={{ fontFamily: "var(--font)", fontWeight: 600, fontSize: 70, lineHeight: "64px", color: "#fff", textAlign: "center" }}>
              Desarrollar con<br />identidad.
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Intro two-column */}
      <section className="hr-section" style={{ padding: "96px 79px", maxWidth: 1440, margin: "0 auto" }}>
        <div className="hr-nosotros-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <FadeIn direction="right">
            <h2 className="hr-nosotros-title" style={{ fontFamily: "var(--font)", fontWeight: 500, fontSize: 43, lineHeight: "50px", marginBottom: 24 }}>
              Una mirada integral sobre<br />el desarrollo inmobiliario.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 20, lineHeight: "26px", color: "var(--black)" }}>
                <strong style={{ color: "var(--black)", fontWeight: 600 }}>Grupo Hughes &amp; Rienzi</strong> nace de la unión de dos miradas complementarias: la arquitectura y el asesoramiento en inversiones inmobiliarias.
              </p>
              <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 20, lineHeight: "26px", color: "var(--black)" }}>
                Esta combinación nos permite abordar cada desarrollo desde una perspectiva integral, contemplando tanto su concepción y diseño como sus aspectos comerciales y financieros.
              </p>
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.1} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 20, lineHeight: "26px", color: "var(--black)" }}>
              Desde nuestros comienzos apostamos por zonas con potencial de crecimiento. Fuimos pioneros en el desarrollo de Carrasco Este, acompañando su transformación y consolidación como una nueva zona residencial de Montevideo.
            </p>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 20, lineHeight: "26px", color: "var(--black)" }}>
              A lo largo de nuestra trayectoria, evolucionamos junto a las nuevas formas de vivir, buscando entender qué necesitan y valoran las personas para crear propuestas que se mantengan vigentes en el tiempo.
            </p>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 20, lineHeight: "26px", color: "var(--black)" }}>
              Experiencia, visión y conocimiento del mercado para transformar oportunidades en realidades.
            </p>
          </FadeIn>
        </div>

        {/* Quote card */}
        <FadeIn>
          <div className="hr-quote-card" style={{ marginTop: 64, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 131, alignItems: "center" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "585 / 414", borderRadius: 57, overflow: "hidden" }}>
              <Image src="/images/nosotros/equipo.jpg" alt="Equipo Grupo Hughes & Rienzi" fill style={{ objectFit: "cover" }} />
            </div>
            <p style={{ fontFamily: "var(--font)", fontWeight: 400, fontSize: 22, lineHeight: "30px", color: "var(--black)" }}>
              &ldquo;Después de más de 20 años, seguimos trabajando con la misma premisa: involucrarnos, cuidar cada decisión y estar presentes en cada etapa.&rdquo;
            </p>
          </div>
        </FadeIn>
      </section>

      <Footer minimal />

      <style>{`
        @media (max-width: 900px) {
          .hr-nosotros-hero-title { font-size: 34px !important; line-height: 38px !important; }
          /* Crop to the trees on the right so the building in the background doesn't take over */
          .hr-nosotros-hero-img { object-position: 92% 50% !important; }
          .hr-nosotros-title { font-size: 30px !important; line-height: 36px !important; }
          .hr-nosotros-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hr-nosotros-grid p { font-size: 16px !important; line-height: 24px !important; }
          .hr-quote-card { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}</style>
    </main>
  );
}
