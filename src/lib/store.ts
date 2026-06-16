// localStorage-backed mock store for registrations (no backend yet)
export type PaymentStatus = "Pendente" | "Parcialmente Pago" | "Pago";
export type RegistrationStatus = "Pré-Inscrito" | "Confirmado" | "Cancelado";
export type Lote = "01" | "02" | "03" | "04";
export type AdminRole = "Administrador" | "Operador";
export type AdminUserStatus = "Ativo" | "Inativo";
export type PaymentMethod = "PIX" | "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "Transferência" | "Boleto" | "Outro";

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string; // ISO date YYYY-MM-DD
  note?: string;
}

export interface Registration {
  id: string;
  createdAt: string;
  // Participant
  participantName: string;
  participantAge: number;
  participantWhatsapp?: string;
  // Guardian
  guardianName: string;
  guardianCpf: string;
  guardianRg: string;
  guardianPhone: string;
  guardianAddress: string;
  guardianRelationship: string;
  // Legal
  imageAuth: "SIM" | "NAO";
  termsAccepted: boolean;
  // Digital signature
  signatureTimestamp: string;
  signatureIp: string;
  signatureUserAgent: string;
  // Admin
  lote: Lote;
  amountDue: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  payments?: Payment[];
}

export interface EventSettings {
  capacity: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
}

const KEY = "levelup_registrations_v1";
const ADMIN_KEY = "levelup_admin_session";
const ADMIN_USERS_KEY = "levelup_admin_users_v1";
const CURRENT_ADMIN_KEY = "levelup_current_admin_user";
const SETTINGS_KEY = "levelup_event_settings_v1";

export function loadSettings(): EventSettings {
  if (typeof window === "undefined") return { capacity: 100 };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { capacity: 100 };
    return JSON.parse(raw);
  } catch {
    return { capacity: 100 };
  }
}
export function saveSettings(s: EventSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function recomputePayment(due: number, payments: Payment[]): { amountPaid: number; paymentStatus: PaymentStatus } {
  const amountPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const paymentStatus: PaymentStatus = amountPaid <= 0 ? "Pendente" : amountPaid >= due ? "Pago" : "Parcialmente Pago";
  return { amountPaid, paymentStatus };
}

export const LOTES: Record<Lote, { price: number; deadline: string }> = {
  "01": { price: 300, deadline: "2026-06-30" },
  "02": { price: 350, deadline: "2026-07-31" },
  "03": { price: 400, deadline: "2026-08-31" },
  "04": { price: 450, deadline: "2026-09-30" },
};

export function getCurrentLote(): Lote {
  const today = new Date();
  for (const l of ["01", "02", "03", "04"] as Lote[]) {
    if (today <= new Date(LOTES[l].deadline)) return l;
  }
  return "04";
}

export function loadAll(): Registration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedMock();
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAll(list: Registration[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addRegistration(r: Registration) {
  const list = loadAll();
  list.unshift(r);
  saveAll(list);
}

export function updateRegistration(id: string, patch: Partial<Registration>) {
  const list = loadAll().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveAll(list);
}

export function deleteRegistration(id: string) {
  saveAll(loadAll().filter((r) => r.id !== id));
}

function seedMock(): Registration[] {
  const mocks: Registration[] = [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      participantName: "João Pedro Silva",
      participantAge: 11,
      participantWhatsapp: "(22) 99999-1111",
      guardianName: "Maria Silva",
      guardianCpf: "123.456.789-09",
      guardianRg: "12.345.678-9",
      guardianPhone: "(22) 98888-2222",
      guardianAddress: "Rua das Flores, 123 - Cabo Frio, RJ",
      guardianRelationship: "Mãe",
      imageAuth: "SIM",
      termsAccepted: true,
      signatureTimestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      signatureIp: "187.45.12.88",
      signatureUserAgent: "Mozilla/5.0 (iPhone) Safari/605",
      lote: "01",
      amountDue: 300,
      amountPaid: 300,
      paymentStatus: "Pago",
      status: "Confirmado",
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      participantName: "Ana Beatriz Costa",
      participantAge: 12,
      guardianName: "Carlos Costa",
      guardianCpf: "987.654.321-00",
      guardianRg: "98.765.432-1",
      guardianPhone: "(22) 97777-3333",
      guardianAddress: "Av. Atlântica, 500 - Cabo Frio, RJ",
      guardianRelationship: "Pai",
      imageAuth: "SIM",
      termsAccepted: true,
      signatureTimestamp: new Date(Date.now() - 86400000).toISOString(),
      signatureIp: "201.10.45.22",
      signatureUserAgent: "Mozilla/5.0 (Windows) Chrome/120",
      lote: "02",
      amountDue: 350,
      amountPaid: 150,
      paymentStatus: "Parcialmente Pago",
      status: "Pré-Inscrito",
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      participantName: "Lucas Oliveira",
      participantAge: 10,
      guardianName: "Juliana Oliveira",
      guardianCpf: "111.222.333-44",
      guardianRg: "11.222.333-4",
      guardianPhone: "(22) 96666-4444",
      guardianAddress: "Rua da Paz, 88 - Unamar, Cabo Frio",
      guardianRelationship: "Mãe",
      imageAuth: "NAO",
      termsAccepted: true,
      signatureTimestamp: new Date().toISOString(),
      signatureIp: "189.78.10.5",
      signatureUserAgent: "Mozilla/5.0 (Android) Chrome/120",
      lote: "02",
      amountDue: 350,
      amountPaid: 0,
      paymentStatus: "Pendente",
      status: "Pré-Inscrito",
    },
  ];
  saveAll(mocks);
  return mocks;
}

// Admin auth (mock)
export const ADMIN_CREDENTIALS = { email: "admin@levelup.com", password: "levelup2026" };
export function loadAdminUsers(): AdminUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) return seedAdminUsers();
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAdminUsers(list: AdminUser[]) {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(list));
}

export function addAdminUser(input: Omit<AdminUser, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const user: AdminUser = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  saveAdminUsers([user, ...loadAdminUsers()]);
  return user;
}

export function updateAdminUser(id: string, patch: Partial<Omit<AdminUser, "id" | "createdAt">>) {
  saveAdminUsers(loadAdminUsers().map((user) => user.id === id ? { ...user, ...patch, updatedAt: new Date().toISOString() } : user));
}

export function deleteAdminUser(id: string) {
  const users = loadAdminUsers();
  const activeAdmins = users.filter((user) => user.role === "Administrador" && user.status === "Ativo");
  const target = users.find((user) => user.id === id);
  if (target?.role === "Administrador" && target.status === "Ativo" && activeAdmins.length <= 1) return false;
  saveAdminUsers(users.filter((user) => user.id !== id));
  if (localStorage.getItem(CURRENT_ADMIN_KEY) === id) logoutAdmin();
  return true;
}

export function getCurrentAdminUser() {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(CURRENT_ADMIN_KEY);
  return loadAdminUsers().find((user) => user.id === id) ?? null;
}

export function loginAdmin(email: string, password: string) {
  const user = loadAdminUsers().find((admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password && admin.status === "Ativo");
  if (user) {
    localStorage.setItem(ADMIN_KEY, "1");
    localStorage.setItem(CURRENT_ADMIN_KEY, user.id);
    return true;
  }
  return false;
}
export function isAdmin() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "1";
}
export function logoutAdmin() { localStorage.removeItem(ADMIN_KEY); localStorage.removeItem(CURRENT_ADMIN_KEY); }

function seedAdminUsers(): AdminUser[] {
  const now = new Date().toISOString();
  const users: AdminUser[] = [{
    id: crypto.randomUUID(),
    name: "Administrador Level Up",
    email: ADMIN_CREDENTIALS.email,
    password: ADMIN_CREDENTIALS.password,
    role: "Administrador",
    status: "Ativo",
    createdAt: now,
    updatedAt: now,
  }];
  saveAdminUsers(users);
  return users;
}

// Masks & validation
export function maskCpf(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) => {
    let s = ""; if (a) s += `(${a}`; if (a.length === 2) s += ") "; if (b) s += b; if (c) s += `-${c}`; return s;
  });
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
}
export function validateCpf(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
  let r = (s * 10) % 11; if (r === 10) r = 0;
  if (r !== parseInt(c[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
  r = (s * 10) % 11; if (r === 10) r = 0;
  return r === parseInt(c[10]);
}

export function exportToCsv(list: Registration[]) {
  const headers = [
    "Participante","Idade","WhatsApp Menor","Responsável","CPF","RG","Telefone","Endereço","Parentesco",
    "Lote","Valor Devido","Valor Pago","Status Pagamento","Status Inscrição",
    "Autoriza Imagem","Aceite Termos","Data Assinatura","IP","User Agent",
  ];
  const rows = list.map(r => [
    r.participantName, r.participantAge, r.participantWhatsapp ?? "",
    r.guardianName, r.guardianCpf, r.guardianRg, r.guardianPhone, r.guardianAddress, r.guardianRelationship,
    r.lote, r.amountDue, r.amountPaid, r.paymentStatus, r.status,
    r.imageAuth, r.termsAccepted ? "SIM" : "NAO", r.signatureTimestamp, r.signatureIp, r.signatureUserAgent,
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `inscritos_levelup_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}
