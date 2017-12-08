const { spawnSync } = require('child_process')

const MASTER = 'master'

const clog = console.log.bind(console)

function error(msg) {
    console.error('Error:', target)
    process.exit(1)
}

const branch = process.argv[1]
const dry = process.argv.indexOf('--dry') !== -1

if (!branch) error('no branch specified')

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

exec('git', ['checkout', MASTER], clog, dry)
exec('git', ['pull', 'origin', MASTER], clog, dry)
exec('git', ['rebase', MASTER, branch, '--autosquash'], clog, dry)
exec('git', ['checkout', MASTER], clog, dry)
exec('git', ['merge', branch], clog, dry)
