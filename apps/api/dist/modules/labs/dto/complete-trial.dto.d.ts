import type { LabTrialOutcome } from '../../../database/entities/lab-trial.entity';
export declare class CompleteTrialDto {
    completedAt: string;
    outcome: LabTrialOutcome;
    doctorNotes: string;
    labInstructions?: string | null;
    attachments?: string[];
}
