'use strict'

const { NL, TAB, clog, error, exec } = require('./common')

function fmt() {
    const type = this.fixup ? 'fixup! ' : ''
    return `${this.hash} ${type}${this.message}`
}

const COMMIT_REGEXP = /([0-9A-Fa-f]*) (fixup! )?(.*)/

const dry = process.argv.indexOf('--dry') !== -1

const target = exec('git', ['log', '--oneline'], stdout => {
    const log = stdout.trim().split(NL).map(commit => {
        const result = COMMIT_REGEXP.exec(commit)

        const hash = result[1]
        const fixup = Boolean(result[2])
        const message = result[3]

        return { hash, message, fixup, fmt }
    })

    if (!log.length) error('empty log')

    const message = log[0].message
    const fixups = []

    for (let commit of log) {
        clog(commit.fmt())

        if (!commit.fixup) return { fixups, commit }

        if (message && commit.message != message) error([
            'fixup mismatch', NL,
            'expected:', NL, TAB, 'fixup!', message, NL,
            'found:', NL, TAB, 'fixup!', commit.message
        ].join(''))

        fixups.push(commit)
    }

    error('all commits are fixups')
})

if (typeof target === 'object' && target) {
    exec('git', ['commit', '--fixup', target.commit.hash], clog, dry)
}

