declare const STATUSES: readonly ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled", "No-Show"];
export declare class UpdateStatusDto {
    status: (typeof STATUSES)[number];
}
export {};
