/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const releaseUtils = require('../../utils/semantic-release.cjs')

const packageName = process.env.PACKAGE // set from workflow input
if (!packageName) throw new Error('PACKAGE env var is required for release')

const config = releaseUtils.getConfig({
  language: 'typescript',
  packageName,
})

// Disable GitHub issue/PR commenting to avoid GraphQL rate limits
config.plugins = config.plugins.map((plugin) => {
  if (Array.isArray(plugin) && plugin[0] === '@semantic-release/github') {
    return [
      '@semantic-release/github',
      {
        ...plugin[1],
        successComment: false,
        failComment: false,
        releasedLabels: false,
      },
    ]
  }
  return plugin
})

config.plugins = [
  ...config.plugins,
  [
    '@semantic-release/npm',
    {
      npmPublish: true,
      // Publish from the built package directory (relative to packages/typescript)
      pkgRoot: `${packageName}/dist`,
    },
  ],
]

module.exports = config
