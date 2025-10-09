/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const releaseUtils = require('../../utils/semantic-release.cjs')

const packageName = process.env.PACKAGE // set from workflow input
if (!packageName) throw new Error('PACKAGE env var is required for release')

const config = releaseUtils.getConfig({
  language: 'typescript',
  packageName,
})

config.plugins = [
  ...config.plugins,
  [
    '@semantic-release/npm',
    {
      npmPublish: true,
      pkgRoot: `${packageName}/dist`,
    },
  ],
]

module.exports = config
