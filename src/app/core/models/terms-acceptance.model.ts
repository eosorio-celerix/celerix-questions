export interface TermsAcceptanceRecord {
  id: string;
  acceptedAt: string;
  accepted: boolean;
  ip: string;
  identityDocument: string;
  userAgent?: string;
}
