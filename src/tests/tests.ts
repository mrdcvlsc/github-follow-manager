import { Octokit } from '@octokit/core'
import { RequestError } from '@octokit/request-error'

async function ASSERT(octokit: Octokit, username: string, following: 'following' | 'not-following') : Promise<boolean> {
  try {
    const response = await octokit.request('GET /user/following/{username}', {
      username: username
    })
    if (response.status === 204 && following === 'following') {
      return true
    } else {
      return false
    }
  } catch (err: unknown) {
    if (err instanceof RequestError) {
      if (err.response?.status === 404 && following === 'not-following') {
        return true
      }
    }
    return false
  }
}

async function test() {
  const results = []
}

test()