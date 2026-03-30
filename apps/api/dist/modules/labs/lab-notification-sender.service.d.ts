import { ConfigService } from '@nestjs/config';
export declare class LabNotificationSender {
    private config;
    private readonly logger;
    private readonly twilioClient;
    private readonly whatsappFrom;
    private readonly nodemailerTransporter;
    private readonly smtpFrom;
    constructor(config: ConfigService);
    isWhatsAppConfigured(): boolean;
    isEmailConfigured(): boolean;
    sendWhatsApp(to: string, body: string): Promise<void>;
    sendEmail(to: string, subject: string, text: string, _context?: {
        patientName: string;
        trialDate: string;
        trialNumber: number;
        workType: string;
        branchName: string;
        branchPhone: string;
    }): Promise<void>;
}
