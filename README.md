<h1 align='center'>dep-bundle-size</h1>

<p align='center'>
<em>Yet another CLI client for <a href="https://bundlephobia.com/" target="_blank">BundlePhobia</a></em>
<br />
<br />
<a href='https://www.npmjs.com/package/dep-bundle-size'>
<img src='https://img.shields.io/npm/v/dep-bundle-size/latest.svg'>
</a>
<a href='https://npmjs.com/package/dep-bundle-size'>
<img src='https://img.shields.io/npm/l/dep-bundle-size' >
</a>
<img src="https://raw.githubusercontent.com/await-ovo/dep-bundle-size/main/assets/pnpm-dlx.png?token=GHSAT0AAAAAABRRY4JYJGRTLBDW2UBNLLOUY7MUU2Q" alt="pnpm dlx dep-bundle-size@latest -r">
</p>


dep-bundle-size is a CLI client for [BundlePhobia](https://bundlephobia.com/) that scans the dependencies in package.json and shows the performance impact of each dependency, and supports monorepo such as [pnpm workspaces](https://pnpm.io/workspaces), [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/), [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces?v=true).


## Features

- 👀 Auto scan package.json
- 🛠️ Work with single package, pnpm workspaces, yarn workspaces and npm workspaces
- ⛓️ Constraint bundle size at dependency installation
- 💡 Use actual installed version of the dependency to analyze
- 💥 Display detailed scan results
- 💎 Use the [@clack/prompts](https://github.com/natemoo-re/clack/tree/main/packages/prompts) for beautiful UI


## How to install

```bash

pnpm add -g dep-bundle-size

// Or use it as dev dependency of a project
pnpm add dep-bundle-size -D

```

## Usage

### dep-bundle-size

```bash
Usage:
  $ dep-bundle-size [...packages]

Commands:
  [...packages]
  add <...packages>

For more info, run any command with the `--help` flag:
  $ dep-bundle-size --help
  $ dep-bundle-size add --help

Options:
  -i, --interactive  Select packages to scan
  -r, --recursive    Scan packages in every project of monorepo
  -d, --dir [dir]    Specify project root directory
  -h, --help         Display this message
  -v, --version      Display version number
```

* dep-bundle-size will scan all dependencies under the project by default, We can manually select the dependencies to be scanned via `--interactive` option:

```bash
○  Select packages to scan.
│  classnames, react-dom
│
○  Scan ./ completed
╔════════════════════════════════════════════════════════════════════════╗
║                              Scan Results                              ║
╟──────────────────┬──────────┬────────────┬───────────────┬─────────────╢
║ Name             │ MIN      │ MIN + GZIP │ SLOW 3G       │ EMERGING 4G ║
╟──────────────────┼──────────┼────────────┼───────────────┼─────────────╢
║ classnames@2.3.2 │ 717.00B  │ 431.00B    │ 8ms           │ 481μs       ║
╟──────────────────┼──────────┼────────────┼───────────────┼─────────────╢
║ react-dom@18.2.0 │ 130.48kB │ 41.99kB    │ 0.8398046875s │ 48ms        ║
╚══════════════════╧══════════╧════════════╧═══════════════╧═════════════╝
```
* In addition to `--interactive`. We can also specify the packge to be scanned directly:

```bash
$ dep-bundle-size classnames react-dom
```
dep-bundle-size will get the actual installed version of the scanned dependencies under the  project, and if a dependency is not installed, we will request the size information of the latest version instead.


### dep-bundle-size add

```bash
Usage:
  $ dep-bundle-size add <...packages>

Options:
  -w, --warning    Use warning instead throw an error if
  -d, --dir [dir]  Specify project root directory
  -h, --help       Display this message
```

The `add` command is mainly used to limit the size of installed dependencies. We can configure size limits(bytes) in package.json:

```
{
  "name": "@pkg/foo",
  "dependencies": {},
  "bundle-phobia": {
    "max-size": 10,
    "max-gzip-size": 100
    "max-overall-size": 1000000
    "max-overall-gzip-size": 1000000
  }
}
```
When installing dependencies(eg.`dep-bundle-size add react react-dom`), we will first check if the dependencies meets the configured constraints, and if it does not, an error will be reported directly:

```bash
$ dep-bundle-size add styled-components

◓  Checking constraints
Error:  Error: Can not install styled-components@5.3.6(33.39kB), Since their max-size is larger than the configured(10.00B).
```


If we want to continue the installation if the constraints are not met, we can use the `--warning` option so that dep-bundle-size will automatically detect the package manager used by the project to complete the installation of the dependencies:

```bash
$ dep-bundle-size add styled-components -w

◓  Checking constraints
Warn:  Can not install styled-components@5.3.6(33.39kB), Since their max-size is larger than the configured(10.00B).
│
○  Checking constraints completed
Info:  Add deps(npm install styled-components)
```

## Credits

This project is highly inspired by [bundle-phobia-cli](https://github.com/AdrieanKhisbe/bundle-phobia-cli) and uses [BundlePhobia](https://bundlephobia.com/) as backend service , thanks to these awesome projects. ♪(･ω･)ﾉ


## License

[MIT License](./LICENSE)

<p align='center'>
Made with ❤️ by <a href="https://github.com/await-ovo">await-ovo</a>
</p>

<p align='center'>Enjoy!</p>
