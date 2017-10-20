import { post, get, Response } from 'got'

const BASE_URL = 'https://circleci.com/api/v1.1'

enum RequestMethod {
  GET = 'get',
  POST = 'post'
}

export class CircleApi {
  private token: string

  constructor (token: string) {
    this.token = token
  }

  /**
   * Execute an API request to create a build on CircleCI for a project.
   *
   * @returns a Promise which executes the build request and returns its response
   */
  public createBuild (organization: string, project: string, buildParameters = {}, branch = 'master'): Promise<Response<string>> {
    const url = `${BASE_URL}/project/github/${organization}/${project}/tree/${branch}`
    const data = {
      build_parameters: {
        ...buildParameters
      }
    }
    return this.request(url, RequestMethod.POST, data)
  }

  /**
   * Execute an API request to get build status on CircleCI for a project.
   *
   * @returns a Promise which executes the build request and returns its response
   */
  public getBuildDetails (organization: string, project: string, buildId: string): Promise<Response<string>> {
    const url = `${BASE_URL}/project/github/${organization}/${project}/${buildId}`
    return this.request(url, RequestMethod.GET)
  }

  private request (url: string, method: RequestMethod, data = {}) {
    const urlWithAuth = `${url}?circle-token=${this.token}`
    const options: any = {
      headers: {
        'User-Agent': 'circleci-job-chain',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    if (method === RequestMethod.POST) {
      options.body = JSON.stringify(data)
      return post(urlWithAuth, options)
    }

    return get(urlWithAuth, options)
  }
}
