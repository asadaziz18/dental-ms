"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPOINTMENT_TYPES = exports.APPOINTMENT_STATUSES = void 0;
/**
 * Appointment — shared between API and web.
 */
exports.APPOINTMENT_STATUSES = [
    'Scheduled',
    'Confirmed',
    'In Progress',
    'Completed',
    'Cancelled',
    'No-Show',
];
exports.APPOINTMENT_TYPES = [
    'consultation',
    'procedure',
    'follow-up',
];
