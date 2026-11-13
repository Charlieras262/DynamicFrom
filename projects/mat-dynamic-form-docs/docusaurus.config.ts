import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const repoUrl = 'https://github.com/Charlieras262/DynamicFrom';

const config: Config = {
  title: 'Mat Dynamic Form',
  tagline: 'Build complete Angular Material forms from a single FormStructure object.',
  favicon: 'img/logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // GitHub Pages defaults for this repository. Change url/baseUrl if the site is hosted elsewhere.
  url: 'https://charlieras262.github.io',
  baseUrl: '/DynamicFrom/',
  organizationName: 'Charlieras262',
  projectName: 'DynamicFrom',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `${repoUrl}/tree/master/projects/mat-dynamic-form-docs/`,
          versions: {
            current: {
              label: '1.7.1',
            },
          },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: `${repoUrl}/tree/master/projects/mat-dynamic-form-docs/`,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'release-1-7-1',
      content:
        'v1.7.1 is out: <code>apply</code> now accepts a block, like Kotlin. <a href="/DynamicFrom/docs/getting-started/first-form#the-apply-method">See how</a>. Coming from 1.6.x? <a href="/DynamicFrom/docs/migration/upgrade-to-1.7.0">Read the upgrade guide</a>.',
      isCloseable: true,
    },
    navbar: {
      title: 'Mat Dynamic Form',
      logo: {
        alt: 'Mat Dynamic Form logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Releases', position: 'left'},
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/mat-dynamic-form',
          label: 'npm',
          position: 'right',
        },
        {
          href: repoUrl,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Installation', to: '/docs/getting-started/installation'},
            {label: 'Upgrade to 1.7.0', to: '/docs/migration/upgrade-to-1.7.0'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'GitHub', href: repoUrl},
            {label: 'Issues', href: `${repoUrl}/issues`},
            {label: 'npm', href: 'https://www.npmjs.com/package/mat-dynamic-form'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Releases', to: '/blog'},
            {label: 'Changelog', to: '/docs/changelog'},
          ],
        },
      ],
      copyright: `Copyright © 2020-${new Date().getFullYear()} Carlos Ramos. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'scss'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
