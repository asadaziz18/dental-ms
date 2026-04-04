import {
  buildMessage,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

/** Same as validator.js `isUUID(s, 'loose')` (8-4-4-4-12 hex). */
const UUID_LOOSE =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

/**
 * Accepts any 8-4-4-4-12 hex UUID string (validator "loose" mode).
 * Use instead of @IsUUID('all'): recent validator versions treat "all" as RFC-only
 * and reject dev-style IDs like 00000000-0000-0000-0000-000000000002.
 */
export function IsUuidString(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isUuidString',
      validator: {
        validate: (value: unknown): boolean =>
          typeof value === 'string' && UUID_LOOSE.test(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be a UUID',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
