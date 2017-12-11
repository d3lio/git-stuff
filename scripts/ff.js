'use strict'

const { ORIGIN, MASTER, clog, exec, hasArg } = require('./common')

const dry = hasArg('--dry')
const merge = hasArg('--merge') || hasArg('-m')

exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { v: 0 }, _branch => {
    const branch = _branch.trim()
    clog(`The current branch is ${branch}`)

    exec('git', ['checkout', MASTER], { dry })
    exec('git', ['remote'], { v: 0 }, _remote => {
        const remote = _remote.trim()

        if (remote && remote === ORIGIN) {
            if (dry) {
                exec('git', ['fetch', remote, MASTER], clog)
            } else {
                exec('git', ['pull', remote, MASTER], clog)
            }
        }
    })

    exec('git', ['rebase', '-i', '--autosquash', MASTER, branch], {
        dry,
        env: {
            GIT_SEQUENCE_EDITOR: 'true'
        }
    })

    if (merge) {
        exec('git', ['checkout', MASTER], { dry })
        exec('git', ['merge', branch], { dry }, clog)
    }
})

