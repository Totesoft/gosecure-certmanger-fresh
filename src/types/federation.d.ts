// Tell TypeScript about the remote module
declare module "gosecure-shell/Keycloak" {
    import type Keycloak from "keycloak-js";

    export const keycloak: Keycloak;
}


declare module "gosecure-shell/KeycloakProvider" {
    import type { FC, ReactNode } from "react";
    import type Keycloak from "keycloak-js";

    export const KeycloakProviderWrapper: FC<{ children: ReactNode }>;

    // ✅ Add this for the hook
    export function useKeycloak(): {
        keycloak: Keycloak;
        initialized: boolean;
    };
}


//useApi
declare module "gosecure-shell/useApi" {
    import { AxiosInstance } from "axios";
    export function useApi(): AxiosInstance;
}