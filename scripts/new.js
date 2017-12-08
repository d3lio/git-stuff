'use strict'

const { clog, error, exec } = require('./common')

const BRANCH_TYPES = {
    feature: 'feature',
    f: 'feature',

    fix: 'fix',
    x: 'fix',

    chore: 'chore',
    c: 'chore',
}

const type = process.argv[2]
const name = process.argv[3]

if (!type) error('no type specified')
if (!name) error('no name specified')

if (!BRANCH_TYPES[type]) error(`unknown branch type ${type}`)

exec('git', ['checkout', '-b', `${BRANCH_TYPES[type]}/${name}`], clog)
