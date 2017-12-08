const { spawnSync } = require('child_process')

const MASTER = 'master'

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

exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], branch => {
    clog(`The current branch is ${branch}`, NL)

    exec('git', ['checkout', MASTER], clog, dry)
    exec('git', ['pull', 'origin', MASTER], clog, dry)
    exec('git', ['rebase', MASTER, branch, '--autosquash'], clog, dry)
    exec('git', ['checkout', MASTER], clog, dry)
    exec('git', ['merge', branch], clog, dry)
})

