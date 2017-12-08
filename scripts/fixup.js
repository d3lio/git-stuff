const { spawnSync } = require('child_process')

const NL = '\n'
const TAB = ' '.repeat(4)
const COMMIT_REGEXP = /([0-9A-Fa-f]*) (fixup! )?(.*)/

const dry = process.argv.indexOf('--dry') !== -1

const clog = console.log.bind(console)

function error(msg) {
    console.error('Error:', target)
    process.exit(1)
}

function exec(command, args, ok, dry) {
    clog(NL, `${dry ? 'x': '>'} ${command} ${args.join(' ')}`, NL)

    if (dry) return

    const result = spawnSync(command, args)
    const stderr = result.stderr.toString()
    const stdout = result.stdout.toString()
    if (result.error || stderr) {
        error(result.error || stderr)
    } else {
        return ok ? ok(stdout) : stdout
    }
}

function fmt() {
    const type = this.fixup ? 'fixup! ' : ''
    return `${this.hash} ${type}${this.message}`
}

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

    for (commit of log) {
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

