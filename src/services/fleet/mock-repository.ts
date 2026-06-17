import type { AuditableEntity, DocumentAttachment } from "@/types/fleet";

const MOCK_DELAY_MS = 180;

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const touch = <T extends AuditableEntity>(record: T): T => ({
  ...record,
  updatedAt: new Date().toISOString(),
});

export const filesToAttachments = (files?: FileList | File[] | null): DocumentAttachment[] => {
  if (!files) {
    return [];
  }

  return Array.from(files).map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
  }));
};

export const firstFileToAttachment = (files?: FileList | File[] | null) =>
  filesToAttachments(files)[0];

export const createMockRepository = <T extends AuditableEntity>(seed: T[]) => {
  let records = clone(seed);

  return {
    async list() {
      await wait();
      return clone(records);
    },

    async getById(id: string) {
      await wait();
      const record = records.find((item) => item.id === id);
      return record ? clone(record) : null;
    },

    async create(payload: Omit<T, keyof AuditableEntity>) {
      await wait();
      const now = new Date().toISOString();
      const record = {
        ...payload,
        id: createId(),
        createdAt: now,
        updatedAt: now,
      } as T;

      records = [record, ...records];
      return clone(record);
    },

    async update(id: string, payload: Partial<Omit<T, keyof AuditableEntity>>) {
      await wait();
      const record = records.find((item) => item.id === id);

      if (!record) {
        throw new Error("Registro não encontrado.");
      }

      const updated = touch({
        ...record,
        ...payload,
      });

      records = records.map((item) => (item.id === id ? updated : item));
      return clone(updated);
    },

    async remove(id: string) {
      await wait();
      records = records.filter((item) => item.id !== id);
    },
  };
};
