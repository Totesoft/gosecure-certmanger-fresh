// Tell TypeScript about the remote module
declare module "gosecure-shell/Keycloak" {
    import type Keycloak from "keycloak-js";

    export const keycloak: Keycloak;
}


declare module "gosecure-shell/KeycloakProvider" {
    import type { FC, ReactNode } from "react";

    export const KeycloakProviderWrapper: FC<{ children: ReactNode }>;
}