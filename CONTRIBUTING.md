# Contributing to Bitburner

## In General

The game is made better because the community as a whole speaks up about
ways to improve the game. Here are some of the ways you can make your voice
heard:

- [Discord](https://discord.gg/XKEGvHqVr3).
  There is a dedicated Discord instance set up for more free-form chats
  between all members of the community. Regular players, heavy scripters,
  Bitburner contributors, and everyone in between can be found on the
  server.
- [Github Issues](https://github.com/bitburner-official/bitburner-src/issues).
  Although the term "issues" can have a negative connotation, they are a
  means of communicating with the community. A new Issue can be an
  interesting new feature that you feel would improve the game. It could be
  an unexpected behavior within the game. Or because the game is about
  scripting perhaps there is something that is conflicting with the
  browser's JavaScript interaction. So please do not be afraid to open a
  [new Issue](https://github.com/bitburner-official/bitburner-src/issues/new).

## Reporting Bugs

The recommended method for reporting a bug is by opening a [Github Issue](https://github.com/bitburner-official/bitburner-src/issues)
or contacting us on the [#bug-report channel](https://discord.com/channels/415207508303544321/415213413745164318).

Alternatively, you can post a bug by creating a post on the
[game's subreddit](https://www.reddit.com/r/Bitburner/).

Before submitting a bug report, please check to make sure the bug has not
already been reported as an [Issue](https://github.com/bitburner-official/bitburner-src/issues).

#### How to Submit a Good Bug Report

- **Use a clear and descriptive title** for the Issue.
- **State your browser, your browser's version, and your computer's OS.**
- **Attach your save file**, if you think it would help solve the Issue.
  Upload your save file as is. Do NOT compress or decompress it.
- **Provide instructions on how to reproduce the bug** in as much detail
  as possible. If you cannot reliably reproduce the bug, then just try
  your best to explain what was happening when the bug occurred.
- **Provide any scripts** that triggered the bug if the Issue is Netscript-related.
- **Open the Console tab in your browser's Dev Tools and report any error-related output**
  that may be printed there. The Dev Tools can be opened on most modern
  browsers by pressing F12 or Ctrl+Shift+I (Cmd + Option + I on macOS machines).

## As a Developer

Anyone is welcome to contribute to Bitburner code. However, please read
the [LICENSE](./license.txt) and the [README](./README.md) before doing so.

To contribute to Bitburner code, you will need to have
[NodeJS](https://nodejs.org) installed. When installing NodeJS, a utility
called `npm` is installed as well.

#### What are you Allowed to Contribute?

Not all code contributions will be accepted. The safest way to ensure
that you don't waste time working on something that gets rejected is to
run your idea(s)/plan(s) past the developers first.
You can contact them through Discord.

Otherwise, here are some general guidelines for determining what types of
changes are okay to contribute:

##### Contributions that will most likely be accepted

- Bug fixes
- Quality-of-life changes
  - Adding a new, commonly-requested Netscript function
  - Fixing or improving UI elements
  - Adding game settings/options
  - Adding a new Terminal command
- Code refactors that conform to good/standard practices

##### Contributions that will not be accepted without prior approval

- Changes that directly affect the game's balance
- New gameplay mechanics

---

## How to setup your fork properly

Clone and fork the game's repository by using one of these methods: web browser, GitHub
Desktop, or command line.

- Web browser. Log in to your GitHub account, navigate to the
  [game's repository](https://github.com/bitburner-official/bitburner-src), and fork the
  repository. Refer to
  [this page](https://docs.github.com/en/get-started/quickstart/fork-a-repo) for more
  detail.
- GitHub Desktop. Click on `File`, then click `Clone repository`. Click on the `URL`
  tab and type `bitburner-official/bitburner-src` into the text box for repository URL. Choose
  the path where you want to clone the repository and click the `Clone` button.
  Refer to [this page](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop)
  for more detail.
- Command line.

```sh
# This clones the game's code repository. The output you get might vary.
$ git clone https://github.com/bitburner-official/bitburner-src.git
Cloning into 'bitburner-src'...
remote: Enumerating objects: 57072, done.
remote: Counting objects: 100% (404/404), done.
remote: Compressing objects: 100% (205/205), done.
remote: Total 57072 (delta 210), reused 375 (delta 199), pack-reused 56668
Receiving objects: 100% (57072/57072), 339.11 MiB | 5.42 MiB/s, done.
Resolving deltas: 100% (43708/43708), done.
Updating files: 100% (2561/2561), done.

# Change to the directory that contains your local copy.
$ cd bitburner-src

# The upstream is the repository that contains the game's source code. The
# upstream is also the place where proposed changes are merged into the game.
$ git remote rename origin upstream
Renaming remote references: 100% (8/8), done.

# The origin is your own copy or fork of the game's source code. Assume that
# your fork will be on GitHub. Change "myname" to your GitHub username. Change
# "myfork" to the name of your forked repository.
$ git remote add origin https://github.com/myname/myfork

# Now "origin" is your fork and "upstream" is where changes should be merged.
$ git remote show
origin
upstream

# You can now download all changes and branches from the upstream repository.
# The output you get might vary.
$ git fetch upstream

# Make sure you always start from "upstream/dev" to avoid merge conflicts.
$ git branch
* dev
$ git branch -r
upstream/HEAD -> upstream/dev
upstream/dev
```

## Development Workflow Best Practices

- Work in a new branch based on the `dev` branch to isolate your changes.

```sh
$ git checkout dev
$ git checkout -b new-stuff-to-add # Create a new branch for your changes.
# ... (Make your changes)
$ git add . # Stage your changes.
$ git commit -m "Commit Message" # Commit your staged changes.
$ git push origin new-stuff-to-add # Push your branch to GitHub.
```

- Keep code changes on a branch as small as possible. This makes it easier for code review. Each branch should be its own independent feature.
- Regularly rebase your branch onto `upstream/dev` to keep it up to date.

```sh
$ git fetch upstream
$ git checkout new-stuff-to-add
$ git rebase upstream/dev
```

## Running locally

Install

- NodeJS (maybe via `nvm`). When installing NodeJS, you also get a tool called `npm`. You can update `npm` to the latest version by running `npm install -g npm@latest`.
- Github Desktop (Windows only)
- Visual Studio Code (optional)

Inside the root of the repository run:

- `npm install` to install all the dependencies; and
- `npm run start:dev` to launch the game in dev mode.

After that you can open any browser and navigate to `localhost:8000` and play the game.
Saving a file will reload the game automatically.

### How to build the electron app

Tested on Node 24.13.0 (LTS) on Windows.

These steps only work in a Bash-like environment, like MinGW for Windows.

```sh
# Install the main game dependencies & build the app in debug mode.
$ npm install
$ npm run build:dev

# Use electron-packager to build the app to the .build/ folder.
$ npm run electron

# And run the game...
$ .build/bitburner-win32-x64/bitburner.exe
```

### Submitting a Pull Request

When submitting a pull request with your code contributions, please abide by
the following rules:

- Work in a branch forked from `dev` to isolate the new code.
- Ensure you have the latest from the [game's main
  repository](../../tree/dev).
- Rebase or merge your branch if necessary.
- Run the game locally to test out your changes (`npm run start:dev`).
- When submitting the pull request, make sure that the base fork is
  _bitburner-official/bitburner-src_ and the base is _dev_.
- If your changes affect the game's UI, attach some screenshots or GIFs showing
  the changes to the UI.
- If your changes affect the Netscript APIs, provide some
  scripts that can be used to test the Netscript changes.
- Ensure you have run `npm run lint` to make sure your changes conform to the
  rules enforced across the code base. The command will fail if any of the
  linters find a violation.
- Ensure you have run `npm run format` to make sure your changes conform to the
  style guide.
- Also, ensure you have run `npm run test` to make sure your changes pass
  the automated tests.
- Do not check in any bundled files (`dist\*.bundle.js`) or the `index.html`
  in the root of the repository. These will be updated as part of official
  releases.
- The title of your Pull Request will need to be formatted like
  `MISC: Reticulated the splines`, where the first word must be capitalised
  and relate to the kind of change being implemented. Possible examples
  are UI, BUGFIX, SERVERS, API... You get the idea.

## As a Documenter

To contribute to and view your changes to the BitBurner documentation in-game, you will
need to edit the files in [this folder](https://github.com/bitburner-official/bitburner-src/tree/dev/src/Documentation/doc/en)

To make change to the [in-game documentation](./markdown/bitburner.md), you will need to modify the [TypeScript definitions](./src/ScriptEditor/NetscriptDefinitions.d.ts), not the Markdown files.

We are using [API Extractor](https://api-extractor.com/pages/tsdoc/doc_comment_syntax/) (tsdoc hints) to generate the Markdown doc. Make your changes to the TypeScript definitions and then run `npm run doc`.

Before submitting your code for a pull request, please try to follow these
rules:

- Work in a branch forked from `dev` to isolate the new code.
- Ensure you have the latest from the [game's main
  repository](../../tree/dev).
- Rebase your branch if necessary.
- When submitting the pull request, make sure that the base fork is
  _bitburner-official/bitburner-src_ and the base is _dev_.

## Deploying a new version

Update the following:

- `src/Constants.ts` `Version` and `LatestUpdate`
- `package.json` `version`
- `doc/source/conf.py` `version` and `release`
- `doc/source/changelog.rst`
- post to Discord
- post to reddit.com/r/Bitburner

## Adding a BN guidelines

Promote:

- New mechanic.
- Coding problems based on NP problems. This makes solutions that are easy to implement inefficient and solutions that are hard to implement efficient. (e.g., Stanek)
- Inter-mechanic synergy.
- Simplicity (e.g., Stanek, Hashnet. Bad example: Corp)

Avoid:

- Failure conditions. It's very frustrating to lose several days' worth of progress.
- Making existing mechanics harder. This makes it hard to port the content to other BNs.

## Troubleshooting common issues

### Unrelated changes in `package-lock.json`

After running `npm install`, if you do not change anything in `package.json` and `package-lock.json` is still changed, you need to update `npm` to the latest version. After that, discard the changes in `package-lock.json`, delete the `node_modules` folder, and run `npm install` again.

### Lots of `peer: true` lines added in `package-lock.json`

npm version 11.6.2 has a bug that causes this. You need to update npm and rerun `npm install`.

See https://github.com/npm/cli/pull/8671 and https://github.com/npm/cli/issues/8690 for details.

### Unrelated failed Jest tests

Some Jest tests fail to run in Node versions older than v24. On those versions, these tests show a small difference between the expected value ("Snapshot") and the actual value ("Received"). You need to use Node v24+ to run these tests.

## TL;DR

- Fork the repo ([How to setup your fork properly](#how-to-setup-your-fork-properly)).
- Make your changes.
- Test your changes manually before submitting anything ([Running locally](#running-locally)).
- Run `npm run format`, `npm run lint`, and `npm run test`. If you make any changes to
  `NetscriptDefinitions.d.ts` or in-game documentation pages, run `npm run doc`.
- Commit your changes ([Development Workflow](#development-workflow-best-practices)).
- Go to GitHub and create a PR [Submitting a Pull Request](#submitting-a-pull-request).
