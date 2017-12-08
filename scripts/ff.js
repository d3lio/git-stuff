'use strict'

const { NL, ORIGIN, MASTER, clog, exec } = require('./common')

const dry = process.argv.indexOf('--dry') !== -1

exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], _branch => {
    const branch = _branch.trim()
    clog(`The current branch is ${branch}`, NL)

    exec('git', ['checkout', MASTER], clog, dry)
    if (exec('git', ['remote']).trim() === ORIGIN) {
        exec('git', ['pull', ORIGIN, MASTER], clog, dry)
    }
    exec('git', ['rebase', '-i', '--autosquash', MASTER, branch], clog, dry)
    exec('git', ['checkout', MASTER], clog, dry)
    exec('git', ['merge', branch], clog, dry)
})

