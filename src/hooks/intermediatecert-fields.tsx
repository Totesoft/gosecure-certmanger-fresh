// IntermediateCertFields.ts

export const IntermediateCertFields = [
    { id: "common_name", label: "Common Name" },
    { id: "organization", label: "Organization" },
    { id: "country", label: "Country (2-letter code)" },
    { id: "keyLength", label: "Key Length" },
    { id: "validity_days", label: "Validity (in days)" },
    { id: "passphrase", label: "Passphrase" },
    { id: "confirmPassphrase", label: "Confirm Passphrase" },
    { id: "parentCA", label: "Parent CA" },
    // { id: "state", label: "State / Province" },          // optional but common
    // { id: "locality", label: "Locality / City" },        // optional but common
    // { id: "organizational_unit", label: "Organizational Unit" }, // optional
    // { id: "email", label: "Email Address" },             // optional if schema allows
];
