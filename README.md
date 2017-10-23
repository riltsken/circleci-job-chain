# circleci-job-chain
A client tool for chaining circleci jobs together and waiting for them to finish. Useful for things like automation testing.

This library is intended to be used from a circleci config rather than cloning the repo your want to run a task from.


## Usage

`npm install -g circleci-job-chain`
```circleci-job-chain --organization mygithuborg --project mygithubproject --circle-token mycircletoken```

```
Options
--organization (required)
--project (required)
--circle-token (required)
--branch
--pollInterval (ms)
--buildOptions
```

## Pros & Cons using this

Pros
 * Configuration is all kept in one place. The secret environment variables dont have to be propagated to multiple repos in circleci
 * Potentially simpler to run an npm script with a circleci token than cloning a repo and configuring it to work.

Cons
 * Uses up an extra executer. Could be potentially expensive if you have many of these jobs tying up executers at once.
