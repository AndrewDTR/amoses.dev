import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

// https://astro.build/config
export default defineConfig({
    site: 'https://amoses.dev',
    integrations: [expressiveCode({
        plugins: [pluginLineNumbers()],
        themes: ["dark-plus"]
    }
    )]
});