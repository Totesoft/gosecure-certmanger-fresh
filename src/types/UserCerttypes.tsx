export type LeafCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;   // "server" | "user" | etc.
    key_length: number;
    valid_from: string;         // ISO datetime
    valid_until: string;        // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;         // ISO datetime
}

export type IntermediateCertificate {
    id: number;
    root_ca_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;       // ISO datetime
    valid_until: string;      // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;       // ISO datetime

    issued_certificates?: LeafCertificate[];
}

export type RootCertificate {
    id: number;
    organization_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;      // ISO datetime
    valid_until: string;     // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;      // ISO datetime
    intermediates?: IntermediateCertificate[];
}

export type ServerCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
}

export type UserCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
}
export type ExpandState = Record<string, boolean>;

export type OrgCertificate {
    id: string;
    common_name: string;
    key_length: number;
    valid_until: string;
    is_active: boolean;
    intermediate_ca_id?: string | null;
}
