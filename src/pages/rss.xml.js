import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
    return rss({
        title: 'Andrew Moses',
        description: 'The personal website & blog of Andrew Moses, a Computer Science student at the University of Wisconsin-Madison.',
        site: context.site,
        items: await pagesGlobToRssItems(
            import.meta.glob('./blog/*.{md,mdx}'),
        ),
        stylesheet: '/rss/styles.xsl',
    });
}