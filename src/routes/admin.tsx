import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_CREDENTIALS, exportToCsv, isAdmin, loadAll, loginAdmin, logoutAdmin,
  LOTES, maskCpf, maskPhone, updateRegistration, addRegistration, deleteRegistration, getCurrentLote,
  loadAdminUsers, addAdminUser, updateAdminUser, deleteAdminUser,
  loadSettings, saveSettings, recomputePayment,
  type AdminRole, type AdminUser, type AdminUserStatus, type EventSettings, type Lote, type Payment, type PaymentMethod, type PaymentStatus, type Registration,
} from "@/lib/store";
import { Download, LogOut, Plus, Search, X, Zap, Pencil, Trash2, UserCog, ShieldCheck, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Level Up 2026" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function Admin() {
  const [logged, setLogged] = useState(false);
  useEffect(() => { setLogged(isAdmin()); }, []);
  if (!logged) return <LoginScreen onLogin={() => setLogged(true)} />;
  return <Dashboard onLogout={() => { logoutAdmin(); setLogged(false); }} />;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-foreground p-4">
      <div className="w-full max-w-sm rounded-3xl bg-background p-8">
        <div className="mb-6 flex items-center gap-2 font-display font-black">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neon text-neon-foreground"><Zap className="h-4 w-4"/></span>
          LEVEL UP · ADMIN
        </div>
        <h1 className="font-display text-2xl font-black">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground">Entre com suas credenciais.</p>
        <form onSubmit={(e)=>{e.preventDefault(); if (loginAdmin(email, pwd)) onLogin(); else setErr("Credenciais inválidas");}} className="mt-5 space-y-3">
          <input className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" placeholder="Senha" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className="btn-neon hover:btn-neon-hover w-full rounded-xl py-3 text-sm">Entrar</button>
        </form>
        <p className="mt-4 rounded-lg bg-muted p-3 text-[11px] text-muted-foreground">
          Demo: <code>{ADMIN_CREDENTIALS.email}</code> / <code>{ADMIN_CREDENTIALS.password}</code>
        </p>
        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:underline">← voltar ao site</Link>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [list, setList] = useState<Registration[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<EventSettings>({ capacity: 100 });
  const [activeTab, setActiveTab] = useState<"registrations" | "users" | "settings">("registrations");
  const [filterLote, setFilterLote] = useState<Lote | "ALL">("ALL");
  const [filterPay, setFilterPay] = useState<PaymentStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Registration | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const refresh = () => setList(loadAll());
  const refreshAdminUsers = () => setAdminUsers(loadAdminUsers());
  const refreshSettings = () => setSettings(loadSettings());
  useEffect(() => { refresh(); refreshAdminUsers(); refreshSettings(); }, []);

  const filtered = useMemo(() => list.filter(r =>
    (filterLote === "ALL" || r.lote === filterLote) &&
    (filterPay === "ALL" || r.paymentStatus === filterPay) &&
    (!search || r.participantName.toLowerCase().includes(search.toLowerCase()) || r.guardianName.toLowerCase().includes(search.toLowerCase()))
  ), [list, filterLote, filterPay, search]);

  useEffect(() => { setPage(1); }, [filterLote, filterPay, search, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);

  const stats = useMemo(() => {
    const totalCap = settings.capacity;
    return {
      total: list.length,
      revenue: list.reduce((s, r) => s + r.amountDue, 0),
      collected: list.reduce((s, r) => s + r.amountPaid, 0),
      remaining: Math.max(0, totalCap - list.length),
      capacity: totalCap,
    };
  }, [list, settings.capacity]);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display font-black">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neon text-neon-foreground"><Zap className="h-3.5 w-3.5"/></span>
            LEVEL UP · ADMIN
          </Link>
          <button onClick={onLogout} className="inline-flex items-center gap-1 rounded-full border border-background/30 px-3 py-1.5 text-xs hover:bg-background/10">
            <LogOut className="h-3.5 w-3.5"/> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2">
          <button onClick={()=>setActiveTab("registrations")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "registrations" ? "bg-foreground text-background" : "hover:bg-muted"}`}>
            <ShieldCheck className="h-4 w-4"/> Inscrições
          </button>
          <button onClick={()=>setActiveTab("users")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "users" ? "bg-foreground text-background" : "hover:bg-muted"}`}>
            <UserCog className="h-4 w-4"/> Usuários admin
          </button>
          <button onClick={()=>setActiveTab("settings")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${activeTab === "settings" ? "bg-foreground text-background" : "hover:bg-muted"}`}>
            <SettingsIcon className="h-4 w-4"/> Configurações
          </button>
        </div>

        {activeTab === "users" ? (
          <UserManagement users={adminUsers} onRefresh={refreshAdminUsers} />
        ) : activeTab === "settings" ? (
          <SettingsPanel settings={settings} onRefresh={refreshSettings} totalInscritos={list.length} />
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total de inscritos" value={stats.total.toString()} />
              <StatCard label="Receita prevista" value={`R$ ${stats.revenue.toLocaleString("pt-BR")}`} />
              <StatCard label="Receita arrecadada" value={`R$ ${stats.collected.toLocaleString("pt-BR")}`} highlight />
              <StatCard label="Vagas restantes" value={stats.remaining.toString()} sub={`cap. ${stats.capacity}`} />
            </div>

            {/* Toolbar */}
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar por participante ou responsável" className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm" />
              </div>
              <select value={filterLote} onChange={(e)=>setFilterLote(e.target.value as any)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="ALL">Todos os lotes</option>
                {(["01","02","03","04"] as const).map(l => <option key={l} value={l}>Lote {l}</option>)}
              </select>
              <select value={filterPay} onChange={(e)=>setFilterPay(e.target.value as any)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="ALL">Todo pagamento</option>
                <option>Pendente</option><option>Parcialmente Pago</option><option>Pago</option>
              </select>
              <button onClick={()=>setAddOpen(true)} className="btn-neon hover:btn-neon-hover inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm">
                <Plus className="h-4 w-4"/> Adicionar
              </button>
              <button onClick={()=>exportToCsv(filtered)} className="inline-flex items-center gap-1 rounded-xl border border-foreground bg-background px-4 py-2 text-sm font-semibold hover:bg-foreground hover:text-background">
                <Download className="h-4 w-4"/> CSV
              </button>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <Th>Participante</Th><Th>Responsável</Th><Th>Telefone</Th><Th>Lote</Th><Th>Pagamento</Th><Th>Status</Th><Th>Ações</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum inscrito encontrado.</td></tr>
                    )}
                    {pageItems.map(r => (
                      <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                        <Td><div className="font-semibold">{r.participantName}</div><div className="text-xs text-muted-foreground">{r.participantAge} anos</div></Td>
                        <Td>{r.guardianName}<div className="text-xs text-muted-foreground">{r.guardianRelationship}</div></Td>
                        <Td>{r.guardianPhone}</Td>
                        <Td><span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-bold text-background">{r.lote}</span></Td>
                        <Td><PayBadge status={r.paymentStatus} paid={r.amountPaid} due={r.amountDue} /></Td>
                        <Td>{r.status}</Td>
                        <Td>
                          <div className="flex gap-1">
                            <button onClick={()=>setDetail(r)} title="Editar" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted">
                              <Pencil className="h-3.5 w-3.5"/> Editar
                            </button>
                            <button onClick={()=>{ if (confirm(`Excluir inscrição de ${r.participantName}?`)) { deleteRegistration(r.id); refresh(); } }} title="Excluir" className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5"/>
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-3 text-xs">
                  <div className="text-muted-foreground">
                    Mostrando <span className="font-bold text-foreground">{pageStart + 1}</span>–<span className="font-bold text-foreground">{Math.min(pageStart + pageSize, filtered.length)}</span> de <span className="font-bold text-foreground">{filtered.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-muted-foreground">Por página:</label>
                    <select value={pageSize} onChange={(e)=>setPageSize(Number(e.target.value))} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                      {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <button onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={currentPage <= 1} className="rounded-lg border border-border bg-background px-3 py-1 font-semibold disabled:opacity-40">‹ Anterior</button>
                    <span className="font-semibold">Página {currentPage} de {totalPages}</span>
                    <button onClick={()=>setPage(p=>Math.min(totalPages, p+1))} disabled={currentPage >= totalPages} className="rounded-lg border border-border bg-background px-3 py-1 font-semibold disabled:opacity-40">Próxima ›</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {detail && <DetailPanel reg={detail} onClose={()=>setDetail(null)} onUpdate={()=>{refresh(); setDetail(loadAll().find(x=>x.id===detail.id) ?? null);}} />}
      {addOpen && <AddManualPanel onClose={()=>setAddOpen(false)} onSaved={()=>{refresh(); setAddOpen(false);}} />}
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-neon bg-neon/10" : "border-border bg-card"}`}>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-black">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-3 text-left font-semibold">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-4 py-3 align-top">{children}</td>; }

function PayBadge({ status, paid, due }: { status: PaymentStatus; paid: number; due: number }) {
  const cls = status === "Pago" ? "bg-neon text-neon-foreground" : status === "Parcialmente Pago" ? "bg-yellow-200 text-yellow-900" : "bg-muted text-muted-foreground";
  return (
    <div>
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>{status}</span>
      <div className="mt-1 text-xs text-muted-foreground">R$ {paid} / R$ {due}</div>
    </div>
  );
}

function UserManagement({ users, onRefresh }: { users: AdminUser[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Operador" as AdminRole, status: "Ativo" as AdminUserStatus });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "Operador", status: "Ativo" });
    setCreating(true);
  }

  function openEdit(user: AdminUser) {
    setCreating(false);
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: user.password, role: user.role, status: user.status });
  }

  function resetForm() {
    setCreating(false);
    setEditing(null);
  }

  function saveUser() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    const duplicate = users.some((user) => user.email.toLowerCase() === form.email.toLowerCase() && user.id !== editing?.id);
    if (duplicate) return alert("Já existe um usuário com este e-mail.");
    if (editing) updateAdminUser(editing.id, form);
    else addAdminUser(form);
    onRefresh();
    resetForm();
  }

  function removeUser(user: AdminUser) {
    if (!confirm(`Excluir usuário ${user.name}?`)) return;
    if (!deleteAdminUser(user.id)) return alert("Mantenha pelo menos um Administrador ativo.");
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <h2 className="font-display text-2xl font-black">Usuários de acesso</h2>
          <p className="text-sm text-muted-foreground">Gerencie quem pode entrar na área administrativa.</p>
        </div>
        <button onClick={openCreate} className="btn-neon hover:btn-neon-hover inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
          <Plus className="h-4 w-4"/> Novo usuário
        </button>
      </div>

      {(creating || editing) && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-black">{editing ? "Editar usuário" : "Criar usuário"}</h3>
            <button onClick={resetForm} className="rounded-full p-1 hover:bg-muted"><X className="h-4 w-4"/></button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <input className={inp} placeholder="Nome" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}/>
            <input className={inp} placeholder="E-mail" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})}/>
            <input className={inp} placeholder="Senha" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})}/>
            <select className={inp} value={form.role} onChange={(e)=>setForm({...form, role: e.target.value as AdminRole})}>
              <option>Administrador</option><option>Operador</option>
            </select>
            <select className={inp} value={form.status} onChange={(e)=>setForm({...form, status: e.target.value as AdminUserStatus})}>
              <option>Ativo</option><option>Inativo</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={saveUser} className="btn-neon hover:btn-neon-hover rounded-xl px-5 py-2 text-sm">Salvar</button>
            <button onClick={resetForm} className="rounded-xl border border-border px-5 py-2 text-sm font-semibold hover:bg-muted">Cancelar</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr><Th>Nome</Th><Th>E-mail</Th><Th>Perfil</Th><Th>Status</Th><Th>Criado em</Th><Th>Ações</Th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-muted/40">
                  <Td><div className="font-semibold">{user.name}</div></Td>
                  <Td>{user.email}</Td>
                  <Td><span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-bold text-background">{user.role}</span></Td>
                  <Td><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${user.status === "Ativo" ? "bg-neon text-neon-foreground" : "bg-muted text-muted-foreground"}`}>{user.status}</span></Td>
                  <Td>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={()=>openEdit(user)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"><Pencil className="h-3.5 w-3.5"/> Editar</button>
                      <button onClick={()=>removeUser(user)} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5"/> Excluir</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_METHODS: PaymentMethod[] = ["PIX", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Transferência", "Boleto", "Outro"];

function todayIso() { return new Date().toISOString().slice(0, 10); }

function DetailPanel({ reg, onClose, onUpdate }: { reg: Registration; onClose: () => void; onUpdate: () => void }) {
  const initialPayments: Payment[] = reg.payments && reg.payments.length > 0
    ? reg.payments
    : reg.amountPaid > 0
      ? [{ id: crypto.randomUUID(), amount: reg.amountPaid, method: "PIX", date: reg.createdAt.slice(0, 10), note: "Migrado" }]
      : [];
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [newPay, setNewPay] = useState<{ amount: string; method: PaymentMethod; date: string; note: string }>({
    amount: "", method: "PIX", date: todayIso(), note: "",
  });

  const totals = useMemo(() => recomputePayment(reg.amountDue, payments), [payments, reg.amountDue]);
  const remaining = Math.max(0, reg.amountDue - totals.amountPaid);

  const [f, setF] = useState({
    participantName: reg.participantName,
    participantAge: reg.participantAge,
    participantWhatsapp: reg.participantWhatsapp ?? "",
    guardianName: reg.guardianName,
    guardianCpf: reg.guardianCpf,
    guardianRg: reg.guardianRg,
    guardianPhone: reg.guardianPhone,
    guardianAddress: reg.guardianAddress,
    guardianRelationship: reg.guardianRelationship,
    imageAuth: reg.imageAuth,
    status: reg.status,
  });

  function addPayment() {
    const amt = Number(newPay.amount);
    if (!amt || amt <= 0) return alert("Informe um valor maior que zero.");
    const updated = [...payments, { id: crypto.randomUUID(), amount: amt, method: newPay.method, date: newPay.date, note: newPay.note || undefined }];
    setPayments(updated);
    setNewPay({ amount: "", method: newPay.method, date: todayIso(), note: "" });
  }
  function removePayment(id: string) {
    if (!confirm("Remover este pagamento?")) return;
    setPayments(payments.filter(p => p.id !== id));
  }

  function save() {
    const { amountPaid, paymentStatus } = recomputePayment(reg.amountDue, payments);
    updateRegistration(reg.id, {
      participantName: f.participantName,
      participantAge: f.participantAge,
      participantWhatsapp: f.participantWhatsapp || undefined,
      guardianName: f.guardianName,
      guardianCpf: f.guardianCpf,
      guardianRg: f.guardianRg,
      guardianPhone: f.guardianPhone,
      guardianAddress: f.guardianAddress,
      guardianRelationship: f.guardianRelationship,
      imageAuth: f.imageAuth,
      paymentStatus,
      amountPaid,
      payments,
      status: f.status,
    });
    onUpdate();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto bg-background p-6 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Editar inscrição</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted"><X className="h-4 w-4"/></button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <Section title="Participante">
            <Lbl>Nome</Lbl>
            <input className={inp} value={f.participantName} onChange={e=>setF({...f, participantName: e.target.value})}/>
            <Lbl>Idade</Lbl>
            <select className={inp} value={f.participantAge} onChange={e=>setF({...f, participantAge: Number(e.target.value)})}>
              {[9,10,11,12,13].map(a=><option key={a} value={a}>{a} anos</option>)}
            </select>
            <Lbl>WhatsApp menor</Lbl>
            <input className={inp} value={f.participantWhatsapp} onChange={e=>setF({...f, participantWhatsapp: maskPhone(e.target.value)})}/>
          </Section>

          <Section title="Responsável legal">
            <Lbl>Nome</Lbl>
            <input className={inp} value={f.guardianName} onChange={e=>setF({...f, guardianName: e.target.value})}/>
            <Lbl>CPF</Lbl>
            <input className={inp} value={f.guardianCpf} onChange={e=>setF({...f, guardianCpf: maskCpf(e.target.value)})}/>
            <Lbl>RG</Lbl>
            <input className={inp} value={f.guardianRg} onChange={e=>setF({...f, guardianRg: e.target.value})}/>
            <Lbl>Telefone</Lbl>
            <input className={inp} value={f.guardianPhone} onChange={e=>setF({...f, guardianPhone: maskPhone(e.target.value)})}/>
            <Lbl>Parentesco</Lbl>
            <select className={inp} value={f.guardianRelationship} onChange={e=>setF({...f, guardianRelationship: e.target.value})}>
              {["Pai","Mãe","Avô","Avó","Tio(a)","Outros"].map(o=><option key={o}>{o}</option>)}
            </select>
            <Lbl>Endereço</Lbl>
            <textarea className={inp} value={f.guardianAddress} onChange={e=>setF({...f, guardianAddress: e.target.value})}/>
            <Lbl>Uso de imagem</Lbl>
            <select className={inp} value={f.imageAuth} onChange={e=>setF({...f, imageAuth: e.target.value as "SIM" | "NAO"})}>
              <option value="SIM">SIM</option><option value="NAO">NÃO</option>
            </select>
          </Section>

          <Section title="Pagamentos">
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted p-3 text-xs">
              <div><div className="text-muted-foreground">Lote</div><div className="font-bold">{reg.lote} · R$ {reg.amountDue}</div></div>
              <div><div className="text-muted-foreground">Pago</div><div className="font-bold text-foreground">R$ {totals.amountPaid}</div></div>
              <div><div className="text-muted-foreground">Restante</div><div className={`font-bold ${remaining === 0 ? "text-foreground" : "text-destructive"}`}>R$ {remaining}</div></div>
            </div>
            <div className="mt-1">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${totals.paymentStatus === "Pago" ? "bg-neon text-neon-foreground" : totals.paymentStatus === "Parcialmente Pago" ? "bg-yellow-200 text-yellow-900" : "bg-muted text-muted-foreground"}`}>{totals.paymentStatus}</span>
            </div>

            {payments.length > 0 && (
              <div className="space-y-1">
                <Lbl>Histórico</Lbl>
                <ul className="space-y-1">
                  {payments.map(p => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs">
                      <div>
                        <div className="font-bold">R$ {p.amount} · {p.method}</div>
                        <div className="text-muted-foreground">{new Date(p.date + "T00:00:00").toLocaleDateString("pt-BR")}{p.note ? ` · ${p.note}` : ""}</div>
                      </div>
                      <button onClick={()=>removePayment(p.id)} className="rounded-md p-1 text-destructive hover:bg-destructive/10" title="Remover"><Trash2 className="h-3.5 w-3.5"/></button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {remaining > 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-3">
                <Lbl>Registrar pagamento</Lbl>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={0} max={remaining} step="0.01" placeholder={`Valor (até R$ ${remaining})`} className={inp} value={newPay.amount} onChange={e=>setNewPay({...newPay, amount: e.target.value})}/>
                  <input type="date" className={inp} value={newPay.date} onChange={e=>setNewPay({...newPay, date: e.target.value})}/>
                  <select className={inp} value={newPay.method} onChange={e=>setNewPay({...newPay, method: e.target.value as PaymentMethod})}>
                    {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
                  </select>
                  <input className={inp} placeholder="Obs. (opcional)" value={newPay.note} onChange={e=>setNewPay({...newPay, note: e.target.value})}/>
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={addPayment} className="btn-neon hover:btn-neon-hover inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5"/> Adicionar pagamento</button>
                  <button onClick={()=>setNewPay({...newPay, amount: String(remaining)})} className="rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-muted">Quitar restante</button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-neon bg-neon/10 px-3 py-2 text-xs font-bold">✓ Valor total quitado</div>
            )}

            <Lbl>Status inscrição</Lbl>
            <select className={inp} value={f.status} onChange={e=>setF({...f, status: e.target.value as Registration["status"]})}>
              <option>Pré-Inscrito</option><option>Confirmado</option><option>Cancelado</option>
            </select>
          </Section>

          <Section title="🔒 Assinatura digital">
            <Row k="Data/Hora" v={new Date(reg.signatureTimestamp).toLocaleString("pt-BR")}/>
            <Row k="IP" v={reg.signatureIp}/>
            <Row k="Aceite termos" v={reg.termsAccepted ? "SIM" : "NÃO"}/>
            <Row k="User Agent" v={reg.signatureUserAgent} mono/>
          </Section>

          <div className="flex gap-2 pt-2">
            <button onClick={save} className="btn-neon hover:btn-neon-hover flex-1 rounded-xl py-2.5 text-sm">Salvar alterações</button>
            <button
              onClick={()=>{ if (confirm(`Excluir inscrição de ${reg.participantName}?`)) { deleteRegistration(reg.id); onUpdate(); onClose(); } }}
              className="inline-flex items-center gap-1 rounded-xl border border-destructive/40 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4"/> Excluir
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="w-28 shrink-0 text-muted-foreground">{k}</div>
      <div className={`flex-1 font-medium break-words ${mono ? "font-mono text-xs" : ""}`}>{v}</div>
    </div>
  );
}
function Lbl({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</label>;
}

const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";

function AddManualPanel({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const lote = getCurrentLote();
  const due = LOTES[lote].price;
  const [f, setF] = useState({
    participantName: "", participantAge: 9,
    guardianName: "", guardianCpf: "", guardianRg: "", guardianPhone: "",
    guardianAddress: "", guardianRelationship: "Mãe",
    initialPayment: "", paymentMethod: "PIX" as PaymentMethod, paymentDate: todayIso(),
  });
  function save() {
    if (!f.participantName || !f.guardianName) return;
    const initAmt = Number(f.initialPayment) || 0;
    const payments: Payment[] = initAmt > 0
      ? [{ id: crypto.randomUUID(), amount: Math.min(initAmt, due), method: f.paymentMethod, date: f.paymentDate }]
      : [];
    const { amountPaid, paymentStatus } = recomputePayment(due, payments);
    addRegistration({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      participantName: f.participantName, participantAge: f.participantAge,
      guardianName: f.guardianName, guardianCpf: f.guardianCpf, guardianRg: f.guardianRg,
      guardianPhone: f.guardianPhone, guardianAddress: f.guardianAddress, guardianRelationship: f.guardianRelationship,
      imageAuth: "SIM", termsAccepted: true,
      signatureTimestamp: new Date().toISOString(),
      signatureIp: "manual-admin", signatureUserAgent: "manual-admin",
      lote, amountDue: due, amountPaid, payments,
      paymentStatus, status: paymentStatus === "Pago" ? "Confirmado" : "Pré-Inscrito",
    });
    onSaved();
  }
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto bg-background p-6" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Adicionar inscrito</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted"><X className="h-4 w-4"/></button>
        </div>
        <div className="mt-2 rounded-xl border border-foreground bg-foreground px-3 py-2 text-xs text-background">
          Lote vigente: <b>{lote}</b> · R$ {due},00 <span className="opacity-70">(definido pela data atual)</span>
        </div>
        <div className="mt-4 space-y-3">
          <input className={inp} placeholder="Nome do participante" value={f.participantName} onChange={e=>setF({...f, participantName: e.target.value})}/>
          <select className={inp} value={f.participantAge} onChange={e=>setF({...f, participantAge: Number(e.target.value)})}>
            {[9,10,11,12,13].map(a=><option key={a} value={a}>{a} anos</option>)}
          </select>
          <input className={inp} placeholder="Responsável" value={f.guardianName} onChange={e=>setF({...f, guardianName: e.target.value})}/>
          <input className={inp} placeholder="CPF" value={f.guardianCpf} onChange={e=>setF({...f, guardianCpf: maskCpf(e.target.value)})}/>
          <input className={inp} placeholder="RG" value={f.guardianRg} onChange={e=>setF({...f, guardianRg: e.target.value})}/>
          <input className={inp} placeholder="Telefone" value={f.guardianPhone} onChange={e=>setF({...f, guardianPhone: maskPhone(e.target.value)})}/>
          <select className={inp} value={f.guardianRelationship} onChange={e=>setF({...f, guardianRelationship: e.target.value})}>
            {["Pai","Mãe","Avô","Avó","Tio(a)","Outros"].map(o=><option key={o}>{o}</option>)}
          </select>
          <textarea className={inp} placeholder="Endereço" value={f.guardianAddress} onChange={e=>setF({...f, guardianAddress: e.target.value})}/>

          <div className="rounded-xl border border-dashed border-border bg-card p-3">
            <Lbl>Pagamento inicial (opcional)</Lbl>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input type="number" min={0} max={due} step="0.01" className={inp} placeholder={`Valor (até R$ ${due})`} value={f.initialPayment} onChange={e=>setF({...f, initialPayment: e.target.value})}/>
              <input type="date" className={inp} value={f.paymentDate} onChange={e=>setF({...f, paymentDate: e.target.value})}/>
              <select className={`${inp} col-span-2`} value={f.paymentMethod} onChange={e=>setF({...f, paymentMethod: e.target.value as PaymentMethod})}>
                {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Deixe o valor vazio para inscrição com pagamento pendente.</p>
          </div>

          <button onClick={save} className="btn-neon hover:btn-neon-hover w-full rounded-xl py-2.5 text-sm">Salvar</button>
        </div>
      </aside>
    </div>
  );
}

function SettingsPanel({ settings, onRefresh, totalInscritos }: { settings: EventSettings; onRefresh: () => void; totalInscritos: number }) {
  const [capacity, setCapacity] = useState<number>(settings.capacity);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  function save() {
    const n = Math.max(0, Math.floor(Number(capacity) || 0));
    saveSettings({ capacity: n });
    setCapacity(n);
    setSavedAt(new Date().toLocaleTimeString("pt-BR"));
    onRefresh();
  }
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-2xl font-black">Configurações do evento</h2>
        <p className="text-sm text-muted-foreground">Defina parâmetros gerais do retiro.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <Lbl>Capacidade total de vagas</Lbl>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input type="number" min={0} value={capacity} onChange={e=>setCapacity(Number(e.target.value))} className={`${inp} max-w-[180px]`}/>
          <button onClick={save} className="btn-neon hover:btn-neon-hover rounded-xl px-5 py-2 text-sm">Salvar</button>
          {savedAt && <span className="text-xs text-muted-foreground">Salvo às {savedAt}</span>}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Inscritos</div>
            <div className="font-display text-2xl font-black">{totalInscritos}</div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Capacidade</div>
            <div className="font-display text-2xl font-black">{capacity}</div>
          </div>
          <div className="rounded-xl border border-neon bg-neon/10 p-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Vagas restantes</div>
            <div className="font-display text-2xl font-black">{Math.max(0, capacity - totalInscritos)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
