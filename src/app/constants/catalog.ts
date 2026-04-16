import { JobCategory } from "../../types/domain";

export const jobCategories: JobCategory[] = [
  "Hogar",
  "Oficios",
  "Delivery",
  "Eventos",
  "Tecnología",
  "Construcción y Mantenimiento",
  "Mecánica y Transporte",
  "Servicios Personales y Estética",
  "Alimentación y Tradición",
  "Oficios Modernos y Digitales",
  "Control de Plagas",
  "Personal Trainer",
  "Otros",
];

export const categoryFilters = ["Todos", ...jobCategories] as const;
