import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
    const originalItems = await pagesGlobToRssItems(
        import.meta.glob('./blog/*.{md,mdx}')
    );

    const itemsWithAuthor = originalItems.map((item) => ({
        ...item,
        author: 'Andrew Moses',
    }));

    return rss({
        title: 'Andrew Moses',
        description:
            'The personal website & blog of Andrew Moses, a Computer Science student at the University of Wisconsin-Madison.',
        site: context.site,
        items: itemsWithAuthor,
        stylesheet: '/rss/styles.xsl',
    });
}