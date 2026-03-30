export declare class CreateLabTrialDto {
    trialDate: string;
    doctorNotes?: string | null;
    labInstructions?: string | null;
    notifyPatient?: boolean;
    channel?: 'whatsapp' | 'email' | 'both';
}
