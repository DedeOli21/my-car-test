import { createMockRepository } from "@/services/fleet/mock-repository";
import { fleetRoutesSeed } from "@/services/fleet/seed";
import type { CreateFleetRoutePayload, FleetRoute, UpdateFleetRoutePayload } from "@/types/fleet";

const repository = createMockRepository<FleetRoute>(fleetRoutesSeed);

export const fleetRouteService = {
  getRoutes() {
    return repository.list();
  },

  getRoute(id: string) {
    return repository.getById(id);
  },

  createRoute(payload: CreateFleetRoutePayload) {
    return repository.create(payload);
  },

  updateRoute(id: string, payload: UpdateFleetRoutePayload) {
    return repository.update(id, payload);
  },

  deleteRoute(id: string) {
    return repository.remove(id);
  },
};
