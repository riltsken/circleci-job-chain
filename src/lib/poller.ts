import { CircleApi } from '../lib/circle-api'

export interface IOptions {
  organization: string
  project: string
  branch: string
  circleToken: string
  pollInterval?: string
  buildOptions?: any
  errorThreshold: number
}

export enum BuildOutcome {
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

export function handleError (error: any, onFailure: Function = () => { return }) {
  if (error && error.statusCode) {
    console.log('**Something went wrong talking to CircleCI API. Exiting.**')
    console.log(error.url)
    console.log(error.statusCode, error.response.body)
  } else {
    console.log(error.stack, error)
  }
  onFailure()
}

export async function poller (options: IOptions,
                              onSuccess: Function = () => { process.exit(0) },
                              onFailure: Function = () => { process.exit(1) }) {
  let buildDetailErrorCount = 0
  const api = new CircleApi(options.circleToken)
  console.log(`Starting job for "${options.project}" on branch "${options.branch}".`)
  let response

  try {
    response = await api.createBuild(options.organization,
                                     options.project,
                                     options.buildOptions || {},
                                     options.branch)
  } catch (e) {
    handleError(e, onFailure)
    return
  }

  const body = JSON.parse(response.body)
  const buildId = body['build_num']
  console.log(`Job for "${options.project}" on branch "${options.branch}" started with build id "${buildId}".`)
  console.log(`Job link: https://circleci.com/gh/${options.organization}/${options.project}/${buildId}`)
  setInterval(async function poll () {
    console.log(`Getting build details.`)
    let response

    try {
      response = await api.getBuildDetails(options.organization, options.project, buildId)
    } catch (e) {
      buildDetailErrorCount++
      if (buildDetailErrorCount <= options.errorThreshold) {
        handleError(e)
      } else {
        handleError(e, onFailure)
      }
      return
    }

    const body = JSON.parse(response.body)
    if (response.statusCode === 200) {
      if (body.outcome === BuildOutcome.SUCCESS) {
        console.log(`Job completed successfully. Exiting.`)
        onSuccess()
        return
      } else if (body.outcome === BuildOutcome.CANCELED ||
                 body.outcome === BuildOutcome.FAILED) {
        console.log(`Job failed or canceled. Exiting.`)
        onFailure()
        return
      } else {
        console.log(`Status currently is "${body.outcome}"`)
      }
    }
  }, parseInt(options.pollInterval || '5000', 10))
}
