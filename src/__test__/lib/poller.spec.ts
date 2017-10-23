import 'mocha'
import * as nock from 'nock'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { expect } from 'chai'

chai.should()
chai.use(chaiAsPromised)
nock.disableNetConnect()

import { poller } from '../../index'

describe('poller', () => {
  let nockScope: nock.Scope

  beforeEach(() => {
    nock.cleanAll()
    nockScope = nock('https://circleci.com').log(console.log)
  })

  // Need to refactor poller to return a promise which can be used in the test
  // to get output vs process.exit
  xit('creates a build and polls for it to complete', async () => {
    nockScope.post('/api/v1.1/project/github/org1/proj1/tree/testbranch')
             .query({'circle-token': 'testtoken'})
             .reply(200, {build_num: 123})

    nockScope.get('/api/v1.1/project/github/org1/proj1/123')
             .query({'circle-token': 'testtoken'})
             .reply(200, {outcome: 'BUILDING'})

    nockScope.get('/api/v1.1/project/github/org1/proj1/123')
             .query({'circle-token': 'testtoken'})
             .reply(200, {outcome: 'BUILDING'})

    nockScope.get('/api/v1.1/project/github/org1/proj1/123')
             .query({'circle-token': 'testtoken'})
             .reply(200, {outcome: 'SUCCESS'})

    let pollerExpectation
    let onSuccess = () => {
      pollerExpectation = 'buildSucceeded'
    }
    let onFailure = () => {
      pollerExpectation = 'buildFailed'
    }

    const options = {
      organization: 'org1',
      project: 'proj1',
      branch: 'testbranch',
      circleToken: 'testtoken',
      pollInterval: '100'
    }
    await poller(options, onSuccess, onFailure).catch(console.log)

    return expect(pollerExpectation).to.eventually.equal('buildSucceeded')
  })
})
