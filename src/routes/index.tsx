import { createFileRoute, Link } from "@tanstack/react-router";
import { LOTES, getCurrentLote } from "@/lib/store";
import { MapPin, Calendar, Users, Zap, Wifi, WifiOff } from "lucide-react";

const bgUrl = "/levelup-bg.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Level Up 2026 — Juniores Conectados | Desconecte-se" },
      { name: "description", content: "Retiro Level Up 2026 da Igreja Semeando Família. 02 a 04 de Outubro no Sítio Shallon, Cabo Frio. Para jovens de 9 a 13 anos." },
      { property: "og:title", content: "Level Up 2026 — Desconecte-se" },
      { property: "og:description", content: "Retiro de juniores 02-04 Outubro, Sítio Shallon, Cabo Frio. Inscreva-se!" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const current = getCurrentLote();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-display font-black tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neon text-neon-foreground">
              <Zap className="h-4 w-4" />
            </span>
            <span>LEVEL UP <span className="text-muted-foreground font-medium">2026</span></span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <a href="#sobre" className="hover:text-foreground/70">Sobre</a>
            <a href="#lotes" className="hover:text-foreground/70">Lotes</a>
            <a href="#info" className="hover:text-foreground/70">Info</a>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
          </nav>
          <Link to="/inscricao" className="btn-neon hover:btn-neon-hover rounded-full px-4 py-2 text-sm">
            Inscrever-se
          </Link>
        </div>
      </header>

      {/* HERO — apenas a imagem do flyer */}
      <section className="relative isolate overflow-hidden bg-foreground pt-6 sm:pt-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-3 sm:px-4">
          <img
            src={bgUrl}
            alt="Level Up 2026 — Desconecte-se"
            className="block h-auto w-full max-h-[80vh] object-contain"
            loading="eager"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* DESTAQUE / CTA */}
      <section className="relative border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              <Wifi className="h-3 w-3 line-through" /> Desconecte-se
            </div>
            <h1 className="font-display text-5xl font-black leading-[0.85] tracking-tight md:text-7xl">
              LEVEL
              <span className="relative ml-2 inline-block">
                <span className="absolute -inset-2 -z-10 rotate-1 bg-neon" />
                <span className="relative">UP</span>
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              O retiro de juniores que vai te <span className="font-bold text-foreground">desconectar do mundo</span> e te conectar com o que realmente importa.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background">
                <Calendar className="h-4 w-4" /> 02 a 04 de Outubro
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
                <Users className="h-4 w-4" /> 9 a 13 anos
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/inscricao" className="btn-neon hover:btn-neon-hover animate-neon-pulse rounded-full px-7 py-4 text-base">
                GARANTIR MINHA VAGA →
              </Link>
              <a href="#lotes" className="rounded-full border border-foreground px-6 py-4 text-sm font-semibold hover:bg-foreground hover:text-background transition">
                Ver Lotes
              </a>
            </div>
          </div>

          {/* Hero card */}
          <div className="relative">
            <div className="glitch-border rounded-3xl bg-card p-1">
              <div className="rounded-[1.4rem] bg-foreground p-8 text-background">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-neon">
                  <span>● Semeando Família</span>
                  <span>2026</span>
                </div>
                <div className="mt-6 font-display text-5xl font-black leading-none">
                  desconecte<span className="text-neon">-se</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Local" value="Sítio Shallon" />
                  <Info label="Cidade" value="Cabo Frio – RJ" />
                  <Info label="Endereço" value="Rua da Paz, 10 e 11 – Unamar" />
                  <Info label="Faixa Etária" value="9 a 13 anos" />
                </div>
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-background/10 p-3">
                  <WifiOff className="h-5 w-5 text-neon" />
                  <span className="text-xs">Sem celular durante o retiro. Bora viver de verdade.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* SOBRE */}
      <section id="sobre" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {[
            { t: "Adoração", d: "Momentos intensos de louvor e conexão com Deus." },
            { t: "Comunhão", d: "Novas amizades, dinâmicas e muita diversão ao ar livre." },
            { t: "Palavra", d: "Mensagens preparadas pra essa geração que precisa se desligar do digital." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-background p-6">
              <div className="mb-3 inline-block rounded-md bg-neon px-2 py-1 font-display text-xs font-black uppercase text-neon-foreground">{c.t}</div>
              <p className="text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOTES */}
      <section id="lotes" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-black md:text-5xl">Escolha seu <span className="bg-neon px-2">LOTE</span></h2>
          <p className="mt-3 text-muted-foreground">Quanto antes, mais barato. As vagas são limitadas.</p>
        </div>
        <div className="mb-6 text-center text-xs text-muted-foreground">
          Apenas o <span className="font-bold text-foreground">lote vigente</span> está disponível para inscrição na data de hoje.
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {(["01","02","03","04"] as const).map((l) => {
            const isCurrent = l === current;
            const [y, m, d] = LOTES[l].deadline.split("-");
            const deadlineLabel = `${d}/${m}/${y}`;
            const past = new Date() > new Date(`${LOTES[l].deadline}T23:59:59`);
            return (
              <div key={l} className={`relative overflow-hidden rounded-3xl border p-6 transition ${isCurrent ? "border-foreground bg-foreground text-background" : "border-border bg-card"} ${past ? "opacity-50" : ""}`}>
                {isCurrent && (
                  <span className="absolute right-4 top-4 rounded-full bg-neon px-2 py-0.5 text-[10px] font-black uppercase text-neon-foreground">Vigente</span>
                )}
                <div className="text-xs font-bold uppercase tracking-widest opacity-70">Lote</div>
                <div className={`font-display text-6xl font-black leading-none ${isCurrent ? "text-neon" : ""}`}>{l}</div>
                <div className="mt-4 text-3xl font-black">R$ {LOTES[l].price},00</div>
                <div className="mt-1 text-sm opacity-70">Inscrição até {deadlineLabel}</div>
                {isCurrent ? (
                  <Link to="/inscricao" className="btn-neon hover:btn-neon-hover mt-5 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-bold transition">
                    Inscrever-se agora
                  </Link>
                ) : (
                  <button disabled className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-border bg-muted px-4 py-3 text-sm font-bold text-muted-foreground">
                    {past ? "Encerrado" : "Em breve"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* INFO */}
      <section id="info" className="border-t border-border bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
          <div>
            <h3 className="font-display text-3xl font-black">Onde rola?</h3>
            <p className="mt-3 flex items-start gap-2 text-background/80">
              <MapPin className="mt-1 h-5 w-5 text-neon" />
              <span>Sítio Shallon — Rua da Paz, 10 e 11<br/>Unamar, Cabo Frio — RJ</span>
            </p>
            <p className="mt-4 text-background/70 text-sm">
              Realização: Igreja Evangélica Semeando Família (CNPJ 23.428.941/0001-26).<br/>
              Responsável: Presb. Thiago Moreira Rangel.
            </p>
          </div>
          <div className="rounded-2xl border border-background/20 bg-background/5 p-6">
            <h4 className="font-display text-xl font-black text-neon">Importante</h4>
            <ul className="mt-3 space-y-2 text-sm text-background/80">
              <li>• A inscrição só é confirmada após quitação do valor do lote.</li>
              <li>• Transporte não está incluso.</li>
              <li>• Chegada dia 02/10 e retorno dia 04/10.</li>
              <li>• Necessário aceite digital do responsável legal.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-8 text-center text-xs text-muted-foreground">
        © 2026 Igreja Evangélica Semeando Família. Level Up — Juniores Conectados.
      </footer>

      {/* Floating CTA */}
      <Link to="/inscricao" className="fixed bottom-5 right-5 z-50 btn-neon hover:btn-neon-hover animate-neon-pulse rounded-full px-5 py-4 text-sm shadow-2xl">
        ⚡ Garantir Minha Vaga
      </Link>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-neon">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
