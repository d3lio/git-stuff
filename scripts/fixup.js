const { spawnSync } = require('child_process')

const NEWLINE = '\n'
const regex = /([0-9A-Fa-f]*) (fixup! )?(.*)/;

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

const dry = process.argv.indexOf('--dry') !== -1

if (dry) console.log('=== Dry run ===', NEWLINE)

const target = exec(spawnSync('git', ['log', '--oneline']), stdout => {
    const log = stdout.trim().split(NEWLINE).map(commit => {
        const result = regex.exec(commit)

        const hash = result[1]
        const fixup = result[2]
        const msg = result[3]

        return {
            hash,
            message: msg,
            fixup: Boolean(fixup),
            fmt
        }
    })

    if (!log.length) return 'Empty log'

    const message = log[0].message;
    const fixups = [];

    for (commit of log) {
        if (!commit.fixup) return { fixups, commit }

        if (message && commit.message != message) return 'Fixup mismatch'

        fixups.push(commit)
    }

    return 'Target not found'
})

if (typeof target === 'object' && target) {
    target.fixups.forEach(commit => console.log(commit.fmt()))
    console.log(target.commit.fmt(), NEWLINE)
    console.log(`# git commit --fixup ${target.commit.hash} #`, NEWLINE)
    if (!dry) exec(spawnSync('git', ['commit', '--fixup', target.commit.hash]), stdout => console.log(stdout))
} else if (typeof target === 'string') {
    console.error('Error:', target)
}

