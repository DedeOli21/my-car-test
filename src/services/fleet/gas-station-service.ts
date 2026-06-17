import { createMockRepository } from "@/services/fleet/mock-repository";
import { gasStationsSeed } from "@/services/fleet/seed";
import type { CreateGasStationPayload, GasStation, UpdateGasStationPayload } from "@/types/fleet";

const repository = createMockRepository<GasStation>(gasStationsSeed);

export const gasStationService = {
  getGasStations() {
    return repository.list();
  },

  getGasStation(id: string) {
    return repository.getById(id);
  },

  createGasStation(payload: CreateGasStationPayload) {
    return repository.create(payload);
  },

  updateGasStation(id: string, payload: UpdateGasStationPayload) {
    return repository.update(id, payload);
  },

  deleteGasStation(id: string) {
    return repository.remove(id);
  },
};
