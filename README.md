# Weather Application

This is a weather application built using Nuxt 3. It provides weather information for various locations and leverages modern web technologies for a seamless user experience.

## Features
- Fetch weather data for different locations.
- Built with Nuxt 3 for server-side rendering (SSR) and static site generation (SSG).
- Includes Pinia for state management and Vuetify for UI components.
- PWA support using `@vite-pwa/nuxt`.

## Scripts

The following scripts are available in the project:

- `dev`: Start the development server.
- `build`: Build the application for SSR deployment (outputs to `.output`).
- `generate`: Generate a static version of the application (outputs to `.output/public`).
- `preview`: Preview the production build locally.
- `clean`: Remove the `dist` folder.
- `deploy`: Deploy the static site to GitHub Pages.

## Deployment

To deploy the static version of the application, run:

```bash
npm run generate
npm run deploy
```

This will generate the static files and deploy them to GitHub Pages.
