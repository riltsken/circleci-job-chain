import 'mocha'
import * as nock from 'nock'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

chai.should()
chai.use(chaiAsPromised)
nock.disableNetConnect()
const timeout = 500

import { CircleApi } from '../../index'

describe('CircleApi', () => {
  let nockScope: nock.Scope

  beforeEach(() => {
    nock.cleanAll()
    nockScope = nock('https://circleci.com').log(console.log).persist()
  })

  it('calls the circleci api to create a build and gets a response', async () => {
    nockScope.matchHeader('Content-Type', 'application/json')
             .matchHeader('User-Agent', 'circleci-job-chain')
             .matchHeader('Accept', 'application/json')
             .post('/api/v1.1/project/github/org1/proj1/tree/master', {build_parameters: {}})
             .query({'circle-token': 'testtoken'})
             .reply(200, {tests: 1})

    const api = new CircleApi('testtoken', timeout)
    await api.createBuild('org1', 'proj1')

    nockScope.done()
  })

  it('calls the circleci api to create a build with parameters', async () => {
    nockScope.matchHeader('Content-Type', 'application/json')
             .matchHeader('User-Agent', 'circleci-job-chain')
             .matchHeader('Accept', 'application/json')
             .post('/api/v1.1/project/github/org1/proj1/tree/master', {build_parameters: {TEST_PARAM: 'a parameter'}})
             .query({'circle-token': 'testtoken'})
             .reply(200)

    const api = new CircleApi('testtoken', timeout)
    await api.createBuild('org1', 'proj1', {TEST_PARAM: 'a parameter'})

    nockScope.done()
  })

  it('calls the circleci api to create a build with a different branch than master', async () => {
    nockScope.matchHeader('Content-Type', 'application/json')
             .matchHeader('User-Agent', 'circleci-job-chain')
             .matchHeader('Accept', 'application/json')
             .post('/api/v1.1/project/github/org1/proj1/tree/sweet-branch', {build_parameters: {}})
             .query({'circle-token': 'testtoken'})
             .reply(200)

    const api = new CircleApi('testtoken', timeout)
    await api.createBuild('org1', 'proj1', {}, 'sweet-branch')

    nockScope.done()
  })

  it('calls the circleci api to get the status of a build and gets a response', async () => {
    nockScope.matchHeader('Content-Type', 'application/json')
             .matchHeader('User-Agent', 'circleci-job-chain')
             .matchHeader('Accept', 'application/json')
             .get('/api/v1.1/project/github/org1/proj1/123')
             .query({'circle-token': 'testtoken'})
             .reply(200)

    const api = new CircleApi('testtoken', timeout)
    await api.getBuildDetails('org1', 'proj1', '123')

    nockScope.done()
  })
})
