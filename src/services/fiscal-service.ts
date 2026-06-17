import type {
  CancelarCTePayload,
  CTe,
  CTeEvent,
  EmitirCartaCorrecaoPayload,
  EmitirCTePayload,
  EnviarEmailTomadorPayload,
  FiscalDocumentFilters,
  FiscalLink,
  ImportarNFePayload,
  MDFe,
  NFe,
  VincularDocumentosFiscaisPayload,
} from "@/types/fiscal";

const SEFAZ_DELAY_MS = 900;
const DEFAULT_DELAY_MS = 260;

const now = "2026-06-05T12:00:00.000Z";

let ctes: CTe[] = [
  {
    id: "cte-1",
    type: "CTE",
    freteId: "freight-1",
    tomadorId: "customer-1",
    chaveAcesso: "35260612345678000190570010000000011000000010",
    numero: "000001",
    serie: "001",
    status: "AUTORIZADO",
    xmlUrl: "/mock-storage/fiscal/cte-000001.xml",
    pdfUrl: "/mock-storage/fiscal/cte-000001.pdf",
    dataEmissao: "2026-06-05T09:30:00.000Z",
    valorTotal: 8500,
    eventos: [
      {
        id: "cte-event-1",
        type: "EMISSAO",
        title: "CT-e autorizado",
        description: "Autorização mockada pela SEFAZ.",
        createdAt: "2026-06-05T09:30:00.000Z",
        createdBy: "Sistema",
      },
    ],
  },
  {
    id: "cte-2",
    type: "CTE",
    freteId: "freight-2",
    tomadorId: "customer-2",
    chaveAcesso: "35260612345678000190570010000000021000000020",
    numero: "000002",
    serie: "001",
    status: "PROCESSANDO",
    xmlUrl: "/mock-storage/fiscal/cte-000002.xml",
    pdfUrl: "/mock-storage/fiscal/cte-000002.pdf",
    dataEmissao: "2026-06-05T11:15:00.000Z",
    valorTotal: 12400,
    eventos: [
      {
        id: "cte-event-2",
        type: "EMISSAO",
        title: "CT-e em processamento",
        description: "Aguardando retorno mockado da SEFAZ.",
        createdAt: "2026-06-05T11:15:00.000Z",
        createdBy: "Sistema",
      },
    ],
  },
];

let nfes: NFe[] = [
  {
    id: "nfe-1",
    type: "NFE",
    freteId: "freight-1",
    chaveAcesso: "35260611111111000100550010000001011000001010",
    numero: "1001",
    serie: "1",
    status: "AUTORIZADO",
    xmlUrl: "/mock-storage/fiscal/nfe-1001.xml",
    pdfUrl: "/mock-storage/fiscal/nfe-1001.pdf",
    dataEmissao: "2026-06-04T14:00:00.000Z",
    valorProdutos: 43000,
    tipo: "SAIDA",
  },
];

let mdfes: MDFe[] = [
  {
    id: "mdfe-1",
    type: "MDFE",
    freteId: "freight-1",
    cteIds: ["cte-1"],
    nfeIds: ["nfe-1"],
    chaveAcesso: "35260622222222000100580010000000011000002020",
    numero: "000001",
    serie: "001",
    status: "AUTORIZADO",
    xmlUrl: "/mock-storage/fiscal/mdfe-000001.xml",
    pdfUrl: "/mock-storage/fiscal/mdfe-000001.pdf",
    dataEmissao: "2026-06-05T10:00:00.000Z",
  },
];

let fiscalLinks: FiscalLink[] = [
  {
    id: "fiscal-link-1",
    freteId: "freight-1",
    cteId: "cte-1",
    mdfeId: "mdfe-1",
    nfeIds: ["nfe-1"],
    updatedAt: now,
  },
];

const wait = (delayMs = DEFAULT_DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const nextNumber = (rows: Array<{ numero: string }>) =>
  String(rows.length + 1).padStart(6, "0");

const createAccessKey = () =>
  Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join("");

const createEvent = (
  cteId: string,
  type: CTeEvent["type"],
  title: string,
  description: string,
  createdBy: string
): CTeEvent => ({
  id: createId("cte-event"),
  type,
  title,
  description,
  createdAt: new Date().toISOString(),
  createdBy,
});

const filterByDate = (dataEmissao: string, startDate: string, endDate: string) => {
  if (!startDate && !endDate) {
    return true;
  }

  const date = new Date(dataEmissao);
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

  return (!start || date >= start) && (!end || date <= end);
};

const mockXmlUrl = (type: string, numero: string) =>
  `/mock-storage/fiscal/${type.toLowerCase()}-${numero}.xml`;

const mockPdfUrl = (type: string, numero: string) =>
  `/mock-storage/fiscal/${type.toLowerCase()}-${numero}.pdf`;

export const fiscalService = {
  async getCTes(filters?: FiscalDocumentFilters) {
    await wait();
    const result = ctes.filter((cte) => {
      if (filters?.status && filters.status !== "ALL" && cte.status !== filters.status) {
        return false;
      }

      if (filters?.tomadorId && filters.tomadorId !== "ALL" && cte.tomadorId !== filters.tomadorId) {
        return false;
      }

      return filterByDate(cte.dataEmissao, filters?.startDate || "", filters?.endDate || "");
    });

    return clone(result.sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()));
  },

  async getNFes() {
    await wait();
    return clone(nfes.sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()));
  },

  async getMDFes() {
    await wait();
    return clone(mdfes.sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()));
  },

  async getFiscalLinks() {
    await wait();
    return clone(fiscalLinks);
  },

  async emitirCTe(payload: EmitirCTePayload) {
    await wait(SEFAZ_DELAY_MS);
    const numero = nextNumber(ctes);
    const status = payload.valorTotal <= 0 ? "REJEITADO" : "AUTORIZADO";

    const cte: CTe = {
      id: createId("cte"),
      type: "CTE",
      freteId: payload.freteId,
      tomadorId: payload.tomadorId,
      chaveAcesso: createAccessKey(),
      numero,
      serie: "001",
      status,
      xmlUrl: mockXmlUrl("cte", numero),
      pdfUrl: mockPdfUrl("cte", numero),
      dataEmissao: new Date().toISOString(),
      valorTotal: payload.valorTotal,
      eventos: [
        createEvent(
          createId("cte"),
          "EMISSAO",
          status === "AUTORIZADO" ? "CT-e autorizado" : "CT-e rejeitado",
          status === "AUTORIZADO"
            ? "CT-e autorizado com sucesso pela SEFAZ mockada."
            : "Rejeição SEFAZ: valor total inválido.",
          "Sistema"
        ),
      ],
    };

    ctes = [cte, ...ctes];
    return clone(cte);
  },

  async cancelarCTe(payload: CancelarCTePayload) {
    await wait(SEFAZ_DELAY_MS);
    const cte = ctes.find((item) => item.id === payload.cteId);

    if (!cte) {
      throw new Error("CT-e não encontrado.");
    }

    if (cte.status !== "AUTORIZADO") {
      throw new Error("Somente CT-e autorizado pode ser cancelado.");
    }

    const updated: CTe = {
      ...cte,
      status: "CANCELADO",
      eventos: [
        createEvent(
          cte.id,
          "CANCELAMENTO",
          "CT-e cancelado",
          payload.justificativa,
          payload.updatedBy
        ),
        ...cte.eventos,
      ],
    };

    ctes = ctes.map((item) => (item.id === cte.id ? updated : item));
    return clone(updated);
  },

  async emitirCartaCorrecao(payload: EmitirCartaCorrecaoPayload) {
    await wait(SEFAZ_DELAY_MS);
    const cte = ctes.find((item) => item.id === payload.cteId);

    if (!cte) {
      throw new Error("CT-e não encontrado.");
    }

    if (cte.status !== "AUTORIZADO") {
      throw new Error("CC-e disponível apenas para CT-e autorizado.");
    }

    const updated: CTe = {
      ...cte,
      eventos: [
        createEvent(
          cte.id,
          "CARTA_CORRECAO",
          "Carta de Correção emitida",
          payload.correcao,
          payload.updatedBy
        ),
        ...cte.eventos,
      ],
    };

    ctes = ctes.map((item) => (item.id === cte.id ? updated : item));
    return clone(updated);
  },

  async enviarEmailTomador(payload: EnviarEmailTomadorPayload) {
    await wait(700);
    const cte = ctes.find((item) => item.id === payload.cteId);

    if (!cte) {
      throw new Error("CT-e não encontrado.");
    }

    const updated: CTe = {
      ...cte,
      eventos: [
        createEvent(
          cte.id,
          "EMAIL_REENVIADO",
          "E-mail reenviado ao tomador",
          payload.tomadorEmail
            ? `Documento reenviado para ${payload.tomadorEmail}.`
            : "Documento reenviado para o e-mail cadastrado do tomador.",
          payload.updatedBy
        ),
        ...cte.eventos,
      ],
    };

    ctes = ctes.map((item) => (item.id === cte.id ? updated : item));
    return clone(updated);
  },

  async importarNFe(payload: ImportarNFePayload) {
    await wait(SEFAZ_DELAY_MS);
    const xmlName = payload.xmlFile?.name;
    const chaveAcesso = payload.chaveAcesso?.trim() || createAccessKey();

    if (!/^\d{44}$/.test(chaveAcesso)) {
      throw new Error("Rejeição SEFAZ: chave de acesso inválida.");
    }

    const numero = String(nfes.length + 1001);
    const nfe: NFe = {
      id: createId("nfe"),
      type: "NFE",
      freteId: payload.freteId || null,
      chaveAcesso,
      numero,
      serie: "1",
      status: "AUTORIZADO",
      xmlUrl: xmlName
        ? `/mock-storage/fiscal/imported/${Date.now()}-${xmlName}`
        : mockXmlUrl("nfe", numero),
      pdfUrl: mockPdfUrl("nfe", numero),
      dataEmissao: new Date().toISOString(),
      valorProdutos: payload.valorProdutos || 0,
      tipo: payload.tipo,
    };

    nfes = [nfe, ...nfes];
    return clone(nfe);
  },

  async vincularDocumentosFiscais(payload: VincularDocumentosFiscaisPayload) {
    await wait();
    const existing = fiscalLinks.find((link) => link.freteId === payload.freteId);
    const link: FiscalLink = {
      id: existing?.id || createId("fiscal-link"),
      freteId: payload.freteId,
      cteId: payload.cteId || null,
      mdfeId: payload.mdfeId || null,
      nfeIds: payload.nfeIds,
      updatedAt: new Date().toISOString(),
    };

    fiscalLinks = existing
      ? fiscalLinks.map((item) => (item.id === existing.id ? link : item))
      : [link, ...fiscalLinks];

    nfes = nfes.map((nfe) => ({
      ...nfe,
      freteId: payload.nfeIds.includes(nfe.id) ? payload.freteId : nfe.freteId,
    }));

    mdfes = mdfes.map((mdfe) =>
      mdfe.id === payload.mdfeId
        ? { ...mdfe, freteId: payload.freteId, cteIds: payload.cteId ? [payload.cteId] : [], nfeIds: payload.nfeIds }
        : mdfe
    );

    return clone(link);
  },
};
