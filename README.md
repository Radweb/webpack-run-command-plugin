# webpack-run-command-plugin
Highly configurable way of running shell commands at any stage of a Webpack build

## Requirements

- Webpack 4.1.0 or higher
- Node.js 4.0.0 or higher

## Installation

`npm i --save-dev @radweb/webpack-run-command-plugin`

## Example

This example runs `chmod` on the file `out/mycompiledbin.sh` after Webpack is finished running

```js
const RunCommandPlugin = require('@radweb/webpack-run-command-plugin')
const path = require('path')

module.exports = {
	//...
	plugins: [
		new RunCommandPlugin({
			stage: 'done',
			run: [{
				cmd: 'chmod 755 mycompiledbin.sh',
				opts: {
					cwd: path.join(__dirname, 'out'),
				},
			}],
		}),
	],
	//...
}
```

## Usage

### `new RunCommandPlugin(opts)`

`opts` is an object that can have the following properties:

property | type | optional | description
----------|------|----------|---------
`stage`   |`string`; Must be a [valid Webpack stage](https://github.com/webpack/docs/wiki/plugins#the-compiler-instance) | no | When to run the series of shell commands
`async`   | `boolean` (default: `true`) | yes | Whether to run the commands asynchronously or not
`parallel` | `boolean` (default: `false`) | yes | Whether to run the async commands in parallel or in sequence. If this is set to `true`, the value of `async` will be ignored
`run` | `Command[]` (Array of `Command` objects) | no | The shell commands to run

### `Command`

An object with the following properties:

property | type | description
---------|------|------------
`cmd`    | string | The shell command to run
`opts`   | An object containing options for [`child_process.exec`](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) | Options to customise the execution of the command. Will commonly contain at least `cwd`
