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

function exec(command, args, opts, ok) {
    if (arguments.length === 2) {
        return execInternal(command, args, {})
    } else if (typeof opts === 'function') {
        return execInternal(command, args, {}, opts)
    } else if (typeof opts === 'object') {
        return execInternal(command, args, opts, ok)
    } else {
        error('unsupported args')
    }
}

function execInternal(command, args, { dry, v, env }, ok) {
    const verbosity = typeof v !== 'number' ? 1 : v

    if (dry) {
        if (verbosity) clog(NL, ` o ${command} ${args.join(' ')}`)
        return null
    }

    const result = env ? spawnSync(command, args, { env }) : spawnSync(command, args)

    const stderr = result.stderr.toString()
    const stdout = result.stdout.toString()
    if (result.error || (result.status && stderr)) {
        if (verbosity) clog(NL, ` x ${command} ${args.join(' ')}`, NL)
        error(result.error || stderr)
    } else {
        if (verbosity) clog(NL, ` > ${command} ${args.join(' ')}`, NL)
        return ok ? ok(stdout) : stdout
    }
}

function hasArg(arg) {
    return process.argv.indexOf(arg) !== -1
}

module.exports = {
    NL,
    TAB,
    MASTER,
    ORIGIN,
    clog,
    error,
    exec,
    hasArg
}
