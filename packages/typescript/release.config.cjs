/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const releaseUtils = require('../../utils/semantic-release.cjs')

const config = releaseUtils.getConfig({
  language: 'typescript',
  packageName: 'algokit_utils',
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

config.plugins = [...config.plugins, ['@semantic-release/npm', { npmPublish: true }]]

module.exports = config
