import { createMockRepository } from "@/services/fleet/mock-repository";
import { vehiclesSeed } from "@/services/fleet/seed";
import type { CreateVehiclePayload, UpdateVehiclePayload, Vehicle } from "@/types/fleet";

const repository = createMockRepository<Vehicle>(vehiclesSeed);

export const vehicleService = {
  getVehicles() {
    return repository.list();
  },

  getVehicle(id: string) {
    return repository.getById(id);
  },

  createVehicle(payload: CreateVehiclePayload) {
    return repository.create(payload);
  },

  updateVehicle(id: string, payload: UpdateVehiclePayload) {
    return repository.update(id, payload);
  },

  deleteVehicle(id: string) {
    return repository.remove(id);
  },
};
