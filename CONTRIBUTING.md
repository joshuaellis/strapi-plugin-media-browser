# Contribute to Strapi Plugin Media Library

## Contribution Prerequisites

- You have [Node.js](https://nodejs.org/en/) at version >= v16 and [Yarn](https://yarnpkg.com/en/) at v1.2.0+ installed.
- You are familiar with [Git](https://git-scm.com).

**Before submitting your pull request** make sure the following requirements are fulfilled:

- Fork the repository and create your new branch from `main`.
- Run `yarn` in the root of the repository.
- Make sure your code lints by running `yarn lint`.

## Development Workflow

### 1. Clone the repository

Clone the repository and go to the root of it

```bash
git clone git@github.com:strapi/cloud.git
cd cloud
```

### 2. Install the dependencies & build

```bash
yarn install
```

---

## Git Conventions

### Commit messages

We use the following convention:

```
type: subject

body
```

The goal of this convention is to help us generate changelogs that can be communicated to our users.

#### Type

The types are based on our GitHub label:

- `fix` When fixing an issue.
- `chore` When doing some cleanup, working on tooling, some refactoring. (usually reserved for **internal** work)
- `doc` When writing documentation.
- `feature`: When working on a feature.

#### Subject

The subject of a commit should be a summary of what the commit is about. It should not describe what the code is doing:

- `feature: what the feature is`
- `fix: what the problem is`
- `chore: what the PR is about`
- `doc: what is documented`

Examples:

- `feature: project names are editable`
- `fix: logout is not working`
- `chore: refactor the database layer`
- `doc: frontend guidelines`

> ⚠️ For a `fix` commit the message should explain what the commit is fixing. Not what the solution.

## Precommit hooks

[Husky](https://typicode.github.io/husky/#/) is used to run handle pre-commit hooks:

- `.husky/pre-commit` -> `eslint` check using `lint-staged`
- `.husky/commit-msg` -> `commitlint` check, configured as described above.

> ⚠️ If your favorite GUI gives you an error when you try to commit, try [this](https://typicode.github.io/husky/#/?id=command-not-found)

---
