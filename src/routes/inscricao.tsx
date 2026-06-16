import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { addRegistration, getCurrentLote, LOTES, maskCpf, maskPhone, validateCpf, type Registration } from "@/lib/store";
import { Check, ChevronLeft, ChevronRight, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/inscricao")({
  head: () => ({ meta: [{ title: "Inscrição — Level Up 2026" }] }),
  component: Wizard,
});

const TERMOS = `DECLARAÇÃO DE COMPROMISSO — RETIRO LEVEL UP 2026

A inscrição no Retiro Level Up 2026 ("Juniores Conectados") só será considerada CONCLUÍDA mediante a quitação integral do valor correspondente ao lote escolhido. Pré-inscrições sem pagamento não garantem vaga.

O TRANSPORTE NÃO ESTÁ INCLUSO no valor da inscrição. Cada família é responsável pela ida e retorno do menor até o local do evento.

Horários:
- Chegada: 02/10/2026 a partir das 18h.
- Saída: 04/10/2026 até as 17h.

Local: Sítio Shallon, Rua da Paz, 10 e 11, Unamar — Cabo Frio/RJ.

Realização: Igreja Evangélica Semeando Família — CNPJ 23.428.941/0001-26.

Responsável eclesiástico pelo evento: Presbítero Thiago Moreira Rangel, CPF 117.158.467-96, que responde institucionalmente pelas atividades, equipe de tios/tias e segurança do menor durante toda a programação.

Ao concluir esta inscrição, o(a) responsável legal declara estar ciente das regras de convivência, programação espiritual e recreativa, regras de uso de eletrônicos (desconexão digital durante o retiro) e autoriza o menor a participar de todas as atividades supervisionadas pela equipe.

Compromete-se também a fornecer informações de saúde relevantes (alergias, medicações em uso) à coordenação na chegada.

A inscrição é INTRANSFERÍVEL. Em caso de desistência, consultar a coordenação sobre as regras de reembolso.

AUTORIZAÇÃO DE USO DE IMAGEM E VOZ:
O(a) responsável legal poderá autorizar, ou não, o uso de imagem e voz do menor em fotos, vídeos e materiais de divulgação da Igreja Evangélica Semeando Família (CNPJ 23.428.941/0001-26), em redes sociais, site institucional e materiais impressos, sem finalidade comercial.

ASSINATURA DIGITAL:
Ao enviar este formulário, o sistema registrará automaticamente data, hora, endereço de IP e dados do navegador, constituindo assinatura eletrônica nos termos da MP 2.200-2/2001 e Lei 14.063/2020, com plena validade jurídica para fins de comprovação do aceite das condições aqui descritas.
`;

function Wizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [data, setData] = useState({
    participantName: "",
    participantAge: 9,
    participantWhatsapp: "",
    guardianName: "",
    guardianCpf: "",
    guardianRg: "",
    guardianPhone: "",
    guardianAddress: "",
    guardianRelationship: "Mãe",
    imageAuth: "" as "" | "SIM" | "NAO",
    termsAccepted: false,
  });

  const lote = getCurrentLote();
  const price = LOTES[lote].price;

  const step1Valid = data.participantName.trim().split(" ").length >= 2 && data.participantAge >= 9 && data.participantAge <= 13;
  const step2Valid = data.guardianName.trim().length > 4 && validateCpf(data.guardianCpf) && data.guardianRg.trim().length >= 4 && data.guardianPhone.replace(/\D/g,"").length >= 10 && data.guardianAddress.trim().length >= 8;
  const step3Valid = !!data.imageAuth && data.termsAccepted;

  async function submit() {
    if (!step3Valid) return;
    setSubmitting(true);
    let ip = "unknown";
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      ip = (await r.json()).ip ?? "unknown";
    } catch {}
    const reg: Registration = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      participantName: data.participantName.trim(),
      participantAge: data.participantAge,
      participantWhatsapp: data.participantWhatsapp || undefined,
      guardianName: data.guardianName.trim(),
      guardianCpf: data.guardianCpf,
      guardianRg: data.guardianRg.trim(),
      guardianPhone: data.guardianPhone,
      guardianAddress: data.guardianAddress.trim(),
      guardianRelationship: data.guardianRelationship,
      imageAuth: data.imageAuth as "SIM" | "NAO",
      termsAccepted: true,
      signatureTimestamp: new Date().toISOString(),
      signatureIp: ip,
      signatureUserAgent: navigator.userAgent,
      lote,
      amountDue: price,
      amountPaid: 0,
      paymentStatus: "Pendente",
      status: "Pré-Inscrito",
    };
    addRegistration(reg);
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-neon">
            <Check className="h-10 w-10 text-neon-foreground" strokeWidth={3} />
          </div>
          <h1 className="font-display text-4xl font-black">Pré-inscrição enviada! ⚡</h1>
          <p className="mt-3 text-muted-foreground">
            Sua pré-inscrição para o <b>Lote {lote}</b> foi registrada com assinatura digital.
            Em breve a coordenação entrará em contato com os dados para pagamento de <b>R$ {price},00</b>.
            A vaga só é confirmada após a quitação.
          </p>
          <Link to="/" className="btn-neon hover:btn-neon-hover mt-8 inline-block rounded-full px-6 py-3 text-sm font-bold">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neon text-neon-foreground"><Zap className="h-3.5 w-3.5"/></span>
            LEVEL UP 2026
          </Link>
          <span className="text-xs text-muted-foreground">Lote {lote} · R$ {price},00</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Stepper */}
        <ol className="mb-8 grid grid-cols-3 gap-2">
          {[1,2,3].map((s) => (
            <li key={s} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${step===s ? "border-foreground bg-foreground text-background" : step>s ? "border-neon bg-neon/20 text-foreground" : "border-border bg-card text-muted-foreground"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${step>=s ? "bg-neon text-neon-foreground" : "bg-muted text-muted-foreground"}`}>{step>s ? <Check className="h-3 w-3"/> : s}</span>
              <span className="hidden sm:inline">{s===1 ? "Participante" : s===2 ? "Responsável" : "Aceite"}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-black">Dados do participante</h2>
              <Field label="Nome completo do menor (sem abreviações) *">
                <input className={inputCls} value={data.participantName} onChange={(e)=>setData({...data, participantName: e.target.value})} placeholder="Ex: João Pedro Silva Santos" />
              </Field>
              <Field label="Idade *">
                <select className={inputCls} value={data.participantAge} onChange={(e)=>setData({...data, participantAge: Number(e.target.value)})}>
                  {[9,10,11,12,13].map(a => <option key={a} value={a}>{a} anos</option>)}
                </select>
              </Field>
              <Field label="WhatsApp do menor (opcional)">
                <input className={inputCls} value={data.participantWhatsapp} onChange={(e)=>setData({...data, participantWhatsapp: maskPhone(e.target.value)})} placeholder="(22) 90000-0000" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-black">Responsável legal</h2>
              <Field label="Nome completo *">
                <input className={inputCls} value={data.guardianName} onChange={(e)=>setData({...data, guardianName: e.target.value})} />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="CPF *" error={data.guardianCpf && !validateCpf(data.guardianCpf) ? "CPF inválido" : ""}>
                  <input className={inputCls} value={data.guardianCpf} onChange={(e)=>setData({...data, guardianCpf: maskCpf(e.target.value)})} placeholder="000.000.000-00" />
                </Field>
                <Field label="RG *">
                  <input className={inputCls} value={data.guardianRg} onChange={(e)=>setData({...data, guardianRg: e.target.value})} />
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Telefone / WhatsApp *">
                  <input className={inputCls} value={data.guardianPhone} onChange={(e)=>setData({...data, guardianPhone: maskPhone(e.target.value)})} placeholder="(22) 90000-0000" />
                </Field>
                <Field label="Grau de parentesco *">
                  <select className={inputCls} value={data.guardianRelationship} onChange={(e)=>setData({...data, guardianRelationship: e.target.value})}>
                    {["Pai","Mãe","Avô","Avó","Tio(a)","Outros"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Endereço completo *">
                <textarea className={inputCls + " min-h-[80px]"} value={data.guardianAddress} onChange={(e)=>setData({...data, guardianAddress: e.target.value})} placeholder="Rua, número, bairro, cidade, UF, CEP" />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-black">Declaração e aceite</h2>
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {TERMOS}
              </div>

              <div className="rounded-2xl border-2 border-foreground p-4">
                <div className="font-bold">Autorização de uso de imagem e voz *</div>
                <p className="mb-3 text-xs text-muted-foreground">Em favor da Igreja Evangélica Semeando Família (CNPJ 23.428.941/0001-26).</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {(["SIM","NAO"] as const).map(v => (
                    <label key={v} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border-2 p-3 transition ${data.imageAuth===v ? "border-neon bg-neon/10" : "border-border"}`}>
                      <input type="radio" name="img" checked={data.imageAuth===v} onChange={()=>setData({...data, imageAuth: v})} className="accent-foreground"/>
                      <span className="font-semibold">{v === "SIM" ? "SIM, autorizo" : "NÃO autorizo"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-muted p-4">
                <input type="checkbox" checked={data.termsAccepted} onChange={(e)=>setData({...data, termsAccepted: e.target.checked})} className="mt-1 h-5 w-5 accent-foreground" />
                <span className="text-sm">
                  Declaro ser o <b>responsável legal</b> pelo menor e <b>concordo</b> com os termos descritos na Autorização para Menor e na Declaração de Compromisso acima.
                </span>
              </label>

              <div className="flex items-start gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-foreground" />
                Ao enviar, sua assinatura digital (data, hora, IP e navegador) será registrada para validade jurídica.
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={()=> step===1 ? navigate({to:"/"}) : setStep(step-1)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
              <ChevronLeft className="h-4 w-4"/> {step===1 ? "Cancelar" : "Voltar"}
            </button>
            {step < 3 ? (
              <button
                disabled={step===1 ? !step1Valid : !step2Valid}
                onClick={()=>setStep(step+1)}
                className="btn-neon hover:btn-neon-hover inline-flex items-center gap-1 rounded-full px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Continuar <ChevronRight className="h-4 w-4"/>
              </button>
            ) : (
              <button
                disabled={!step3Valid || submitting}
                onClick={submit}
                className="btn-neon hover:btn-neon-hover inline-flex items-center gap-1 rounded-full px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? "Enviando..." : "Enviar inscrição ⚡"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-neon/40 focus:border-foreground focus:ring-2";

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
