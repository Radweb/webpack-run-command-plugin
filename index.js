const child_process = require('child_process')
const assert = require('assert')

function assertOption(optName, opts, ownProperty) {
	ownProperty = ownProperty || false
	if (ownProperty) {
		assert(opts.hasOwnProperty(optName), `[run-command] Missing required option ${optName}`)
	} else {
		assert(optName in opts, `[run-command] Missing required option ${optName}`)
	}
}

function valueOr(optName, opts, alt) {
	if (optName in opts) return opts[optName]
	return alt
}

function createCommandRunner(args) {
	return new Promise((resolve, reject) => {
		child_process.exec(args.cmd, args.opts, (err, stdout, stderr) => {
			if (err != null || !!stderr) {
				reject(err || stderr)
			} else {
				resolve(stdout)
			}
		})
	})
}

function RunCommandPlugin(opts) {
	if (!(this instanceof RunCommandPlugin)) return new RunCommandPlugin(opts)
	
	assertOption('stage', opts)
	assertOption('run', opts)

	if (!Array.isArray(opts.run)) {
		opts.run = [opts.run]
	}

	this.opts = opts
}

RunCommandPlugin.prototype.apply = function applyRunCommandPlugin(compiler) {
	const stage = this.opts.stage
	const run = this.opts.run
	const parallel = valueOr('parallel', this.opts, false)
	const asynchronous = parallel || valueOr('async', this.opts, true)

	const plugin = { name: 'Run Command' }

	assert(stage in compiler.hooks, `[run-command] Attmepting to run at invalid stage ${stage}. 
Stage must be one of these values: 
${Object.keys(compiler.hooks).map(key => '  - ' + key).join('\n')}
`)

	if (asynchronous) {
		compiler.hooks[stage].tapPromise(plugin, () => {
			if (parallel) {
				return Promise.all(run.map(createCommandRunner))
			} else {
				return run.reduce((prev, args) => {
					return prev.then(() => createCommandRunner(args))
				}, Promise.resolve(undefined))
			}
		})
	} else {
		compiler.hooks[stage].tap(plugin, () => {
			for (const args of run) {
				child_process.execSync(args.cmd, args.opts)
			}
		})
	}
}

module.exports = RunCommandPlugin
