import { CircleApi } from '../lib/circle-api'

export interface IOptions {
  organization: string
  project: string
  branch: string
  circleToken: string
  pollInterval: string
  buildOptions: any
}

export enum BuildOutcome {
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

export function handleError (error: any) {
  if (error && error.statusCode) {
    console.log('**Something went wrong talking to CircleCI API. Exiting.**')
    console.log(error.url)
    console.log(error.statusCode, error.response.body)
  } else {
    console.log(error.stack, error)
  }
  process.exit(1)
}

export async function poller (options: IOptions) {
  const api = new CircleApi(options.circleToken)
  console.log(`Starting job for "${options.project}" on branch "${options.branch}".`)
  let response

  try {
    response = await api.createBuild(options.organization,
                                     options.project,
                                     options.buildOptions || {},
                                     options.branch)
  } catch (e) {
    handleError(e)
    return
  }

  const body = JSON.parse(response.body)
  const buildId = body['build_num']
  console.log(`Job for "${options.project}" on branch "${options.branch}" started with build id "${buildId}".`)
  setInterval(async function poll () {
    console.log(`Getting build details.`)
    let response

    try {
      response = await api.getBuildDetails(options.organization, options.project, buildId)
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
  }, parseInt(options.pollInterval || '5000', 10))
}
