# AlwaysMutualGroups

Adds a **Mutual Groups** tab to full Discord user profiles. The tab lists every group DM that contains both you and the profile owner. Selecting a row opens that group DM.

## Recommended setup

Current Vencord builds include an official **MutualGroupDMs** plugin, but Discord's July 2026 desktop profile experiment does not call its section-injection hook. This standalone plugin uses the rendered profile UI instead, so the count remains visible in that experiment. Disable the official plugin while this one is enabled.

## Standalone installation

1. Install Vencord from source.
2. Copy this whole `AlwaysMutualGroups` folder into `src/userplugins` in your Vencord checkout.
3. From the Vencord directory, run `pnpm install` if dependencies are not installed.
4. Add `--disable-updater` to the checkout's `build` script, then run `pnpm build` and `pnpm inject`. This keeps official Vencord updates from replacing the custom renderer.
5. Restart Discord, open **User Settings → Vencord → Plugins**, and confirm **AlwaysMutualGroups** is enabled.
6. Update Vencord by fast-forwarding the checkout and rebuilding it. Do not turn the built-in updater back on.

## Behavior

- The full profile adds a **Mutual Groups** tab for human users, even when there are no shared group DMs.
- The compact profile popout shows the mutual-group count beside Mutual Friends and Mutual Servers.
- Selecting the popout count opens the full profile directly on the Mutual Groups tab.
- Bots and your own profile are excluded.
- Data comes from Discord's local private-channel store. The plugin makes no external requests and adds no telemetry.

## Compatibility

Validated against Vencord `1.15.4` and Discord Desktop `0.0.410` on September 9, 2026.

Discord profile markup is not a stable API. If the tab disappears after an update, inspect the rendered profile roles and stable profile class names used by `decorateFullProfile` and `decorateProfilePopout`.

## License

GPL-3.0-or-later. This plugin is based on Vencord's official `MutualGroupDMs` plugin by amia and Vencord contributors.
