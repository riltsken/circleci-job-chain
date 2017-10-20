import { CircleApi } from '../lib/circle-api'
import * as argv from 'yargs'

let cliArgs = argv.demandOption(['organization','project','circle-token'])
                  .argv

const organization: string = cliArgs.organization
const project: string = cliArgs.project
const branch: string = cliArgs.branch
const circleToken: string = cliArgs['circle-token']
const pollInterval: string = cliArgs['poll-interval']
// const buildOptions: any = cliArgs.buildOptions

enum BuildOutcome {
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

function handleError (error: any) {
  if (error && error.statusCode) {
    console.log('**Something went wrong talking to CircleCI API. Exiting.**')
    console.log(error.url)
    console.log(error.statusCode, error.response.body)
  } else {
    console.log(error.stack, error)
  }
  process.exit(1)
}

async function main () {
  const api = new CircleApi(circleToken)
  console.log(`Starting job for "${project}" on branch "${branch}".`)
  let response

  try {
    response = await api.createBuild(organization, project, {}, branch)
  } catch (e) {
    handleError(e)
    return
  }

  const body = JSON.parse(response.body)
  const buildId = body['build_num']
  console.log(`Job for "${project}" on branch "${branch}" started with build id "${buildId}".`)
  setInterval(async function poll () {
    console.log(`Getting build details.`)
    let response

    try {
      response = await api.getBuildDetails(organization, project, buildId)
    } catch (e) {
      handleError(e)
      return
    }

    const body = JSON.parse(response.body)
    if (response.statusCode === 200) {
      if (body.outcome === BuildOutcome.SUCCESS) {
        console.log(`Job completed successfully. Exiting.`)
        process.exit(0)
      } else if (body.outcome === BuildOutcome.CANCELED ||
                 body.outcome === BuildOutcome.FAILED) {
        console.log(`Job failed or canceled. Exiting.`)
        process.exit(1)
      } else {
        console.log(`Status currently is "${body.outcome}"`)
      }
    }
  }, parseInt(pollInterval || '5000', 10))
}

main().catch(console.log)
