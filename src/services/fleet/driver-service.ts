import { createMockRepository } from "@/services/fleet/mock-repository";
import { driversSeed } from "@/services/fleet/seed";
import type { CreateDriverPayload, Driver, UpdateDriverPayload } from "@/types/fleet";

const repository = createMockRepository<Driver>(driversSeed);

export const driverService = {
  getDrivers() {
    return repository.list();
  },

  getDriver(id: string) {
    return repository.getById(id);
  },

  createDriver(payload: CreateDriverPayload) {
    return repository.create(payload);
  },

  updateDriver(id: string, payload: UpdateDriverPayload) {
    return repository.update(id, payload);
  },

  deleteDriver(id: string) {
    return repository.remove(id);
  },
};
