import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { selectMutualGroup } from "../navigation.ts";

const vencordRoot = process.env.VENCORD_ROOT;

const channelId = "123456789012345678";

test("the Vencord lazy implementation reproduces Reflect.get on a missing profile module", { skip: !vencordRoot && "Set VENCORD_ROOT to test the upstream lazy implementation" }, async () => {
    const { proxyLazy } = createRequire(import.meta.url)(path.join(vencordRoot!, "src/utils/lazy.ts"));
    const missingProfileActions = proxyLazy(() => null) as any;
    await delay(1);
    assert.throws(() => missingProfileActions.closeUserProfileModal(), /Reflect.get called on non-object/);
});

test("native group selection runs before modals close and preserves method binding", () => {
    const calls: string[] = [];
    const actions = { marker: "native", selectPrivateChannel(id: string) { assert.equal(this.marker, "native"); calls.push(id); } };
    assert.equal(selectMutualGroup(channelId, { getChannel: () => ({ isGroupDM: () => true }), findSelectionActions: () => actions, closeModals: () => calls.push("closed") }), true);
    assert.deepEqual(calls, [channelId, "closed"]);
});

test("missing or malformed native action never throws or dismisses the profile", () => {
    for (const candidate of [null, undefined, {}, 42, "missing", { selectPrivateChannel: null }, { selectPrivateChannel: "invalid" }]) {
        let closed = false;
        assert.equal(selectMutualGroup(channelId, { getChannel: () => ({ isGroupDM: () => true }), findSelectionActions: () => candidate, closeModals: () => { closed = true; } }), false);
        assert.equal(closed, false);
    }
});

test("stale channels, direct messages and guild channels cannot navigate through a group row", () => {
    for (const channel of [undefined, { isGroupDM: () => false }]) {
        assert.equal(selectMutualGroup(channelId, { getChannel: () => channel, findSelectionActions: () => { throw new Error("Must not resolve an action for a stale or non-group channel"); }, closeModals: () => { throw new Error("Must not close"); } }), false);
    }
});

test("untrusted channel identifiers are rejected before store or action access", () => {
    for (const id of ["", "123", "../@me", "123456789012345678?query", "a".repeat(18)])
        assert.equal(selectMutualGroup(id, { getChannel: () => { throw new Error("Invalid identifier must not reach the store"); }, findSelectionActions: () => null, closeModals: () => {} }), false);
});

test("a native navigation exception is not suppressed or followed by profile dismissal", () => {
    let closed = false;
    assert.throws(() => selectMutualGroup(channelId, { getChannel: () => ({ isGroupDM: () => true }), findSelectionActions: () => ({ selectPrivateChannel() { throw new Error("Native failure"); } }), closeModals: () => { closed = true; } }), /Native failure/);
    assert.equal(closed, false);
});

test("an unavailable action is resolved again on the next click", () => {
    let ready = false, selected = false;
    const dependencies = { getChannel: () => ({ isGroupDM: () => true }), findSelectionActions: () => ready ? { selectPrivateChannel() { selected = true; } } : null, closeModals: () => {} };
    assert.equal(selectMutualGroup(channelId, dependencies), false);
    ready = true;
    assert.equal(selectMutualGroup(channelId, dependencies), true);
    assert.equal(selected, true);
});
