// src/lib/form-data.ts
type FormDataValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | File
  | Blob
  | Date
  | FormDataValue[]
  | { [key: string]: FormDataValue };

export function toFormData(
  body: Record<string, FormDataValue>,
  options: {
    arrayFormat?: "repeat" | "bracket" | "json";
    includeNullish?: boolean;
  } = {},
): FormData {
  const { arrayFormat = "repeat", includeNullish = false } = options;
  const form = new FormData();

  const stringify = (value: FormDataValue): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "true" : "false";
    return String(value);
  };

  const append = (key: string, value: FormDataValue): void => {
    if (value === null || value === undefined) {
      if (includeNullish) form.append(key, "");
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
      return;
    }

    if (value instanceof Date) {
      form.append(key, value.toISOString());
      return;
    }

    if (Array.isArray(value)) {
      const files: (File | Blob)[] = [];
      const primitives: FormDataValue[] = [];

      for (const item of value) {
        if (item instanceof File || item instanceof Blob) files.push(item);
        else primitives.push(item);
      }

      // Files: always repeated key — matches FilesInterceptor('images')
      for (const file of files) form.append(key, file);

      // Primitives: follow arrayFormat
      if (primitives.length > 0) {
        if (arrayFormat === "json") {
          form.append(key, JSON.stringify(primitives));
        } else {
          const suffix = arrayFormat === "bracket" ? "[]" : "";
          for (const item of primitives) {
            form.append(`${key}${suffix}`, stringify(item));
          }
        }
      }
      return;
    }

    if (typeof value === "object") {
      form.append(key, JSON.stringify(value));
      return;
    }

    form.append(key, stringify(value));
  };

  for (const [key, value] of Object.entries(body)) {
    append(key, value);
  }

  return form;
}