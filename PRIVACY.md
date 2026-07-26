# Privacy Policy

PalKnobs is a local desktop application for editing a Palworld dedicated server's
settings. It is designed to run entirely on your own computer.

## What PalKnobs does with your data

- **It reads and writes only your local `PalWorldSettings.ini` file**, plus a small
  local config file (`config.json` in your user profile) that remembers the path
  you chose and any update version you dismissed. Nothing you view or edit is sent
  anywhere.
- **PalKnobs has no analytics, telemetry, tracking, accounts, or ads.** It does not
  collect, store, or transmit any personal information.
- **There is no PalKnobs server, and no data is ever sent to the developer.**

## Network access

PalKnobs makes two kinds of outbound network request, both to third parties and
neither containing any personal information about you:

1. **Update check** — it queries GitHub's public Releases API (`api.github.com`)
   to see whether a newer version of PalKnobs is available. This reveals your IP
   address to GitHub and is subject to
   [GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
2. **Fonts** — the interface loads its typefaces from Google Fonts
   (`fonts.googleapis.com`), which reveals your IP address to Google and is
   subject to [Google's Privacy Policy](https://policies.google.com/privacy).

Both are ordinary web requests that expose nothing about you beyond what any web
request inherently does (your IP address). PalKnobs sends no information about you,
your server, or your settings in either request.

## Changes

If this policy changes, the updated version will be published in this repository.

## Contact

Questions? Open an issue at <https://github.com/jasonrundell/palknobs/issues>.

---

_PalKnobs is an unofficial, fan-made tool and is not affiliated with, endorsed by,
or sponsored by Pocketpair, Inc._
