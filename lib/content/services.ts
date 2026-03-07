import { services } from "@/content/services";

export function getAllServices() {
  return services;
}

export function getFeaturedServices() {
  return services.filter((entry) => entry.featured);
}
