import { createMockRepository } from "@/services/fleet/mock-repository";
import { suppliersSeed } from "@/services/fleet/seed";
import type { CreateSupplierPayload, Supplier, UpdateSupplierPayload } from "@/types/fleet";

const repository = createMockRepository<Supplier>(suppliersSeed);

export const supplierService = {
  getSuppliers() {
    return repository.list();
  },

  getSupplier(id: string) {
    return repository.getById(id);
  },

  createSupplier(payload: CreateSupplierPayload) {
    return repository.create(payload);
  },

  updateSupplier(id: string, payload: UpdateSupplierPayload) {
    return repository.update(id, payload);
  },

  deleteSupplier(id: string) {
    return repository.remove(id);
  },
};
