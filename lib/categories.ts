// Shared by the filter UI and the assistant, so both use the same ids.

export const JOB_CATEGORIES = [
  { id: "tailor", label: "Tailor", synonyms: ["tailor", "sewing", "penjahit", "jahit"] },
  { id: "builder", label: "Builder", synonyms: ["builder", "construction", "tukang", "bangunan"] },
  { id: "driver", label: "Driver", synonyms: ["driver", "driving", "supir", "sopir"] },
  { id: "housekeeping", label: "Housekeeper", synonyms: ["housekeeper", "housekeeping", "cleaner", "cleaning", "asisten rumah tangga", "pembantu"] },
  { id: "vendor", label: "Vendor", synonyms: ["vendor", "seller", "sales", "pedagang", "penjual"] },
  { id: "technician", label: "Technician", synonyms: ["technician", "repair", "mechanic", "teknisi", "montir"] },
  { id: "cook", label: "Cook", synonyms: ["cook", "chef", "kitchen", "pemasak", "juru masak", "koki"] },
  { id: "admin", label: "Admin", synonyms: ["admin", "office", "administrasi"] },
] as const;

export type JobCategoryId = (typeof JOB_CATEGORIES)[number]["id"];
export const JOB_CATEGORY_IDS = JOB_CATEGORIES.map((c) => c.id) as [JobCategoryId, ...JobCategoryId[]];

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];
