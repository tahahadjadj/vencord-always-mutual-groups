# AlwaysMutualGroups

Adds a **Mutual Groups** tab to full Discord user profiles. The tab lists every group DM that contains both you and the profile owner. Selecting a row opens that group DM.

## Recommended setup

Current Vencord builds include an official **MutualGroupDMs** plugin, but Discord's July 2026 desktop profile experiment does not call its section-injection hook. This standalone plugin uses the rendered profile UI instead, so the count remains visible in that experiment. Disable the official plugin while this one is enabled.

## Standalone installation

1. Install Vencord from source.
2. Copy this whole `AlwaysMutualGroups` folder into `src/userplugins` in your Vencord checkout.
3. From the Vencord directory, run `pnpm install` if dependencies are not installed.
4. Add `--disable-updater` to the checkout's `build` script, then run `pnpm build` and `pnpm inject`.
5. Protect the installed bundle with `chflags uchg "$HOME/Library/Application Support/Vencord/dist/"*`.
6. Restart Discord, open **User Settings → Vencord → Plugins**, and confirm **AlwaysMutualGroups** is enabled.
7. Before an intentional update, run `chflags nouchg "$HOME/Library/Application Support/Vencord/dist/"*`. Rebuild and reinstall, then apply the protection again.

## Behavior

- The full profile adds a **Mutual Groups** tab for human users, even when there are no shared group DMs.
- The compact profile popout shows the mutual-group count beside Mutual Friends and Mutual Servers.
- Selecting a group row validates that the group still exists, uses Discord's native private-channel selection action, then dismisses the profile. If navigation is unavailable, the profile stays open with an explanation.
- Selecting the popout count opens the full profile directly on the Mutual Groups tab.
- Bots and your own profile are excluded.
- Data comes from Discord's local private-channel store. The plugin makes no external requests and adds no telemetry.

## Compatibility

Validated against Vencord `1.15.6` at commit `339b85b` and Discord Desktop `0.0.411` on September 15, 2026.

Discord profile markup is not a stable API. If the tab disappears after an update, inspect the rendered profile roles and stable profile class names used by `decorateFullProfile` and `decorateProfilePopout`.

## Navigation repair verification

The October 4, 2026 repair removes a profile-close action that can resolve to a missing lazy module and throw `Reflect.get called on non-object`. Group selection resolves the native action at click time and selects the destination before closing modals. Invalid/stale groups and missing actions keep the profile open; native navigation exceptions are not suppressed.

Seven synthetic regression tests pass, including the upstream lazy-null reproduction, native action binding/order, missing action, stale/non-group channels, invalid identifiers, native failure and retry. To run them against a Vencord checkout:

```sh
VENCORD_ROOT=/path/to/Vencord npx --yes tsx@4.20.5 --test tests/navigation.test.ts
```

Without `VENCORD_ROOT`, the six standalone navigation tests run and the upstream reproduction is skipped. The complete Vencord build, TypeScript, lint and stylesheet checks passed against base `7f0c10cc29fd789f2f4828ae3dc947623e837920`. Authenticated native Discord verification passed three clicks across two destinations: correct routes, profile dismissal and return navigation, without a visible error. No private group IDs/names, account data or screenshots are included in the tests. This repository has no configured GitHub Actions workflow.

## License

GPL-3.0-or-later. This plugin is based on Vencord's official `MutualGroupDMs` plugin by amia and Vencord contributors.
