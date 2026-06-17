import { createMockRepository } from "@/services/fleet/mock-repository";
import { refuelingsSeed } from "@/services/fleet/seed";
import type { CreateRefuelingPayload, Refueling, UpdateRefuelingPayload } from "@/types/fleet";

const repository = createMockRepository<Refueling>(refuelingsSeed);

export const refuelingService = {
  getRefuelings() {
    return repository.list();
  },

  getRefueling(id: string) {
    return repository.getById(id);
  },

  createRefueling(payload: CreateRefuelingPayload) {
    return repository.create(payload);
  },

  updateRefueling(id: string, payload: UpdateRefuelingPayload) {
    return repository.update(id, payload);
  },

  deleteRefueling(id: string) {
    return repository.remove(id);
  },
};
