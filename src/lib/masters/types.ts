export type MasterOption = { value: string; label: string };
export type MasterField = {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "date"
    | "time"
    | "checkbox"
    | "select"
    | "multiselect";
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  valueType?: "number";
  filter?: boolean;
  defaultValue?: string | number | boolean;
  description?: string;
  options?: MasterOption[];
  lookup?: { endpoint: string; labelKey?: string; valueKey?: string };
};
export type MasterConfig = {
  slug: string;
  title: string;
  singular: string;
  description: string;
  endpoint: string;
  fields: MasterField[];
  columns: {
    key: string;
    label: string;
    type?: "date" | "time" | "boolean" | "list";
  }[];
};
export type MasterRecord = { id: number; [key: string]: unknown };
export type MasterSearch = Record<string, string | string[] | undefined>;
export type MasterActionState = {
  message: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};
