import { FORM_SCHEMAS } from "./form-schemas.js";

function isHex(value) {
  return /^[0-9a-fA-F]+$/.test(value);
}

function utf8ByteLength(value) {
  return new TextEncoder().encode(value).length;
}

function validateCustomRule(rule, value) {
  if (rule !== "pubkey-format") {
    return null;
  }

  const compressed = value.length === 66 && (value.startsWith("02") || value.startsWith("03"));
  const uncompressed = value.length === 130 && value.startsWith("04");

  if (!compressed && !uncompressed) {
    return "поддерживаются только compressed (33 байта) и uncompressed (65 байт) ключи";
  }

  return null;
}

export function validateBySchema(schemaName, input) {
  const schema = FORM_SCHEMAS[schemaName];

  if (!schema) {
    throw new Error(`Неизвестная схема: ${schemaName}`);
  }

  const errors = [];

  for (const [fieldName, rules] of Object.entries(schema.fields)) {
    const rawValue = input[fieldName];
    const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;
    const label = rules.label ?? fieldName;

    if (rules.required) {
      const emptyString = typeof value === "string" && value.length === 0;
      const missing = value === undefined || value === null || emptyString;
      if (missing) {
        errors.push(`${label}: поле обязательно`);
        continue;
      }
    }

    if (!rules.required) {
      const emptyString = typeof value === "string" && value.length === 0;
      const missingOptional = value === undefined || value === null || emptyString;
      if (missingOptional) {
        continue;
      }
    }

    if (rules.type === "integer") {
      if (!Number.isInteger(value)) {
        errors.push(`${label}: должно быть целым числом`);
        continue;
      }

      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${label}: значение должно быть >= ${rules.min}`);
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${label}: значение должно быть <= ${rules.max}`);
      }

      continue;
    }

    if (rules.type === "number") {
      if (typeof value !== "number" || Number.isNaN(value)) {
        errors.push(`${label}: должно быть числом`);
        continue;
      }

      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${label}: значение должно быть >= ${rules.min}`);
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${label}: значение должно быть <= ${rules.max}`);
      }

      continue;
    }

    if (rules.type === "string") {
      if (typeof value !== "string") {
        errors.push(`${label}: должно быть строкой`);
        continue;
      }

      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${label}: длина должна быть >= ${rules.minLength} символов`);
      }

      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${label}: длина должна быть <= ${rules.maxLength} символов`);
      }

      if (rules.maxBytesUtf8 !== undefined && utf8ByteLength(value) > rules.maxBytesUtf8) {
        errors.push(`${label}: длина должна быть <= ${rules.maxBytesUtf8} байт в UTF-8`);
      }

      continue;
    }

    if (rules.type === "enum") {
      if (!rules.options.includes(value)) {
        errors.push(`${label}: должно быть одним из значений [${rules.options.join(", ")}]`);
      }
      continue;
    }

    if (rules.type === "hex") {
      if (typeof value !== "string" || !isHex(value)) {
        errors.push(`${label}: должно быть hex-строкой`);
        continue;
      }

      if (rules.exactLength !== undefined && value.length !== rules.exactLength) {
        errors.push(`${label}: длина должна быть ровно ${rules.exactLength} символов`);
      }

      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${label}: длина должна быть >= ${rules.minLength} символов`);
      }

      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${label}: длина должна быть <= ${rules.maxLength} символов`);
      }

      if (rules.evenLength && value.length % 2 !== 0) {
        errors.push(`${label}: длина должна быть четной`);
      }

      if (rules.custom) {
        const customError = validateCustomRule(rules.custom, value);
        if (customError) {
          errors.push(`${label}: ${customError}`);
        }
      }
    }
  }

  return errors;
}
