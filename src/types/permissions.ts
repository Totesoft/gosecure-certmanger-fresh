// src/types/permissions.ts
export type Permission = "read" | "write" | "admin";
export function canAccess(userPermissions: Permission[], required: Permission): boolean {
    return userPermissions.includes(required) || userPermissions.includes("admin");
}