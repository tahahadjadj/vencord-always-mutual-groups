/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

interface NavigationDependencies {
    getChannel(id: string): { isGroupDM(): boolean; } | undefined;
    findSelectionActions(): unknown;
    closeModals(): void;
}

// Resolve the named native group-selection action at click time, without a lazy proxy.
export function selectMutualGroup(channelId: string, dependencies: NavigationDependencies): boolean {
    if (!/^\d{17,20}$/.test(channelId) || !dependencies.getChannel(channelId)?.isGroupDM()) return false;
    const candidate = dependencies.findSelectionActions();
    if (candidate == null || (typeof candidate !== "object" && typeof candidate !== "function")) return false;
    const actions = candidate as { selectPrivateChannel?: (id: string) => void; };
    if (typeof actions.selectPrivateChannel !== "function") return false;

    actions.selectPrivateChannel(channelId);
    // The old profile-specific close action may not exist; the native modal API suffices.
    dependencies.closeModals();
    return true;
}
