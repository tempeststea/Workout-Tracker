[README.md](https://github.com/user-attachments/files/30482256/README.md)
# Workout tracker

A small standalone web app for planning and logging workouts. No account, no server — everything is saved to your browser's local storage, on whichever device you open it on (same setup as Panel).

## Running it

Just open `index.html` in a browser — that's it, no build step or install needed.

## Deploying it (so it has its own URL)

Any static host works. The easiest options:

- **Vercel / Netlify**: drag the `workout-tracker` folder onto the dashboard (or connect it as a repo). No build command needed — it's a static site.
- **GitHub Pages**: push the folder to a repo and enable Pages on the branch.

## What's inside

- `index.html` — page structure
- `style.css` — all styling, including the color palette
- `app.js` — app logic (data storage, rendering, streak/stats calculations)

## Notes

- Data lives in `localStorage` under the key `workoutTrackerData` — clearing browser data/site data will erase it, and it won't follow you to another browser or device.
- Muting a day excludes it from the current streak and the weekly trend chart, but keeps whatever was logged for it.
