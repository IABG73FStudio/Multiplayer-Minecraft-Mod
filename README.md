# Forge 1.20.1 integration — next stage

This web/API archive does not include a compiled Minecraft mod.
The mod should be a separate Forge 1.20.1 Gradle project and communicate with this API over HTTPS.

Recommended client-side flow:
1. Player signs in to the Hub account from the mod UI.
2. Mod obtains a short-lived session token from the API.
3. Mod requests the player's equipped skin metadata.
4. Skin PNG is downloaded from the API and cached locally by content hash.
5. Client applies the skin through the appropriate Minecraft player skin/render integration.

Before public use, design a secure account-linking flow and do not embed server secrets in the mod.
Do not treat client-reported coin balances or purchases as authoritative.
