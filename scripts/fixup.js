const { spawnSync } = require('child_process')

const NL = '\n'
const TAB = ' '.repeat(4)
const COMMIT_REGEXP = /([0-9A-Fa-f]*) (fixup! )?(.*)/

const dry = process.argv.indexOf('--dry') !== -1

function exec(result, ok) {
    if (result.error || result.stderr.toString()) {
        console.error('Error:', result.error || result.stderr.toString())
        return null
    } else {
        return ok ? ok(result.stdout.toString()) : null
    }
}

function fmt() {
    const type = this.fixup ? 'fixup! ' : ''
    return `${this.hash} ${type}${this.message}`
}

if (dry) console.log('=== Dry run ===', NL)

const target = exec(spawnSync('git', ['log', '--oneline']), stdout => {
    const log = stdout.trim().split(NL).map(commit => {
        const result = COMMIT_REGEXP.exec(commit)

        const hash = result[1]
        const fixup = Boolean(result[2])
        const message = result[3]

        return { hash, message, fixup, fmt }
    })

    if (!log.length) return 'empty log'

    const message = log[0].message
    const fixups = []

    for (commit of log) {
        console.log(commit.fmt())
        if (!commit.fixup) return { fixups, commit }

        if (message && commit.message != message) return [
            'fixup mismatch', NL,
            'expected:', NL, TAB, 'fixup!', message, NL,
            'found:', NL, TAB, 'fixup!', commit.message
        ].join('')

        fixups.push(commit)
    }

    return 'all commits are fixups'
})

if (typeof target === 'object' && target) {
    console.log(NL, `# git commit --fixup ${target.commit.hash} #`, NL)
    if (!dry) exec(spawnSync('git', ['commit', '--fixup', target.commit.hash]), stdout => console.log(stdout))
} else if (typeof target === 'string') {
    console.error('Error:', target)
}

