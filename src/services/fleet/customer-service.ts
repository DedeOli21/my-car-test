import { createMockRepository } from "@/services/fleet/mock-repository";
import { customersSeed } from "@/services/fleet/seed";
import type { CreateCustomerPayload, Customer, UpdateCustomerPayload } from "@/types/fleet";

const repository = createMockRepository<Customer>(customersSeed);

export const customerService = {
  getCustomers() {
    return repository.list();
  },

  getCustomer(id: string) {
    return repository.getById(id);
  },

  createCustomer(payload: CreateCustomerPayload) {
    return repository.create(payload);
  },

  updateCustomer(id: string, payload: UpdateCustomerPayload) {
    return repository.update(id, payload);
  },

  deleteCustomer(id: string) {
    return repository.remove(id);
  },
};
