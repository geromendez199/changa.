import { JobCategory } from "../../types/domain";

export const jobCategories: JobCategory[] = ["Hogar", "Oficios", "Delivery", "Eventos", "Tecnología", "Otros"];

export const categoryFilters = ["Todos", ...jobCategories] as const;
