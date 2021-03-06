module.exports = {
    title: 'Epochtalk Documentation', // Title of the website
    // appears in the meta tag and as a subtitle
    description: "Next generation forum software",
    themeConfig: {
        nav: [
            { text: 'Get Started', link: '/get-started/installation' },
            { text: 'Features', link: '/reference/features' },
            { text: 'API', link: '/reference/api-reference' },
            { text: 'Github', link: 'https://github.com/epochtalk/epochtalk' },
        ],
        sidebar: [
            {
                title: 'Get Started',
                collapsable: false,
                children: [
                    '/get-started/installation',
                    '/get-started/configuration',
                    '/get-started/deploying'
                ]
            },
            {
                title: 'Reference',
                collapsable: false,
                children: [
                    '/reference/features',
                    '/reference/api-reference',
                    '/reference/contributions',
                    '/reference/license'
                ]
            }
        ]
    }
}
