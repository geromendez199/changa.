import { JobCategory } from "../../types/domain";

export const jobCategories: JobCategory[] = [
  "Hogar",
  "Construcción y Mantenimiento",
  "Oficios",
  "Control de Plagas",
  "Mecánica y Transporte",
  "Delivery",
  "Servicios Personales y Estética",
  "Alimentación y Tradición",
  "Tecnología",
  "Oficios Modernos y Digitales",
  "Personal Trainer",
  "Eventos",
  "Otros",
];

export const categoryFilters = ["Todos", ...jobCategories] as const;

export const primaryCategoryFilters = [
  "Todos",
  "Hogar",
  "Construcción y Mantenimiento",
  "Oficios",
  "Delivery",
  "Tecnología",
  "Servicios Personales y Estética",
] as const;
