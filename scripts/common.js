'use strict'

const { spawnSync } = require('child_process')

const NL = '\n'
const TAB = ' '.repeat(4)
const ORIGIN = 'origin'
const MASTER = 'master'
const clog = console.log.bind(console)

function error(msg) {
    console.error('Error:', msg)
    process.exit(1)
}

function exec(command, args, ok, dry) {
    clog(NL, `${dry ? 'x': '>'} ${command} ${args.join(' ')}`, NL)

    if (dry) return

    const result = spawnSync(command, args)

    const stderr = result.stderr.toString()
    const stdout = result.stdout.toString()
    if (result.error || (result.status && stderr)) {
        error(result.error || stderr)
    } else {
        return ok ? ok(stdout) : stdout
    }
}

module.exports = {
    NL,
    TAB,
    MASTER,
    ORIGIN,
    clog,
    error,
    exec
}
