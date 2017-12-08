'use strict'

const { NL, TAB, clog, error, exec } = require('./common')

const MASTER = 'master'

const dry = process.argv.indexOf('--dry') !== -1

exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], branch => {
    clog(`The current branch is ${branch}`, NL)

    exec('git', ['checkout', MASTER], clog, dry)
    exec('git', ['pull', 'origin', MASTER], clog, dry)
    exec('git', ['rebase', MASTER, branch, '--autosquash'], clog, dry)
    exec('git', ['checkout', MASTER], clog, dry)
    exec('git', ['merge', branch], clog, dry)
})

