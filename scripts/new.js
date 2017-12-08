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

const type = process.argv[1]
const name = process.argv[2]

if (!type) error('no type specified')
if (!name) error('no name specified')

if (BRANCH_TYPES[TYPE]) error(`unknown branch type ${type}`)

exec('git', ['checkout', '-b', `${BRANCH_TYPES[TYPE]}/${name}`], clog)
