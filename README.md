# the bar

Front end for **the bar** (https://thebar.letsfriggen.party): a home cocktail recipe box with
"Booze & Vinyl" pairings, where each record side gets a drink.

Built with React 19, React Router 7, Vite 8 and axios. The API is a separate FastAPI back end
(`wellhuzzah/recipebox`), served under `/api` on the same host.

## Pages

| Route | What it shows |
|---|---|
| `/` | Home: the Now Serving letter board, the featured-menu card deck, then search and tag filters over all recipes |
| `/recipes/:id` | One recipe, with its Booze & Vinyl record if it has one |
| `/booze-and-vinyl` | Every album side, grouped by album and volume, with owned/spun filters |
| `/booze-and-vinyl/:id` | One album side and its linked recipe |
| `/admin` | Recipe editing, Booze & Vinyl entries, stats and the featured menu |

### Admin

`/admin` only opens when the page's hostname is a local address (`127.*`, `10.*`, `192.168.*`).
That check is a convenience, not security. The API key you type in on the admin page is what
authorizes changes. The front end never stores the key or ships it in the bundle.

The **Featured Menu** tab picks what the home page card deck shows: a title, tags (a recipe
matching any of them is included) and hand-picked recipes. When the menu is off or empty, the
deck shows 10 random recipes.

## Development

```sh
npm install
npm run dev     # Vite dev server on http://127.0.0.1:5173
npm run build   # production build into dist/
npm run lint
```

- The API base URL is set in one place, [`src/api/client.js`](src/api/client.js). Pages that use
  `fetch` instead of axios read it from there too (`api.defaults.baseURL`).
- [`vite.config.js`](vite.config.js) binds the dev server to `127.0.0.1` and only accepts the
  `thebar.letsfriggen.party` host, so it is reached through the reverse proxy, not directly over the network.
- `npm run lint` currently reports some React Compiler rule errors (`react-hooks/*`) in
  `App.jsx`, `CardDeck.jsx`, `FeaturedMenuForm.jsx`, `Admin.jsx` and `RecipeForm.jsx`. They don't
  affect the build.

## Deployment

Since November 2026, Caddy serves the production build in `dist/`, not the Vite dev server.

- Saved edits are not live until `npm run build`. The build takes about a second, and the site
  changes as soon as it finishes, because Caddy serves `dist/` directly.
- Git operations (`switch`, `checkout`, `stash`, `reset`) no longer change the live site by
  themselves. The next build does.
- The Windows service that ran `npm run dev` (`recipe_box_ui`) is disabled.
- The simplest edit loop is: edit, `npm run build`, refresh. `npm run dev` still works, but a page
  opened at `localhost:5173` cannot load data. The API only accepts requests from the `thebar`
  origin (CORS in the API's `app/main.py`).
