import { Octokit } from '@octokit/core'
import { RequestError } from '@octokit/request-error'

// ##############################################################################################
// EDIT ZONE : START v

// user imports and env

// EDIT ZONE : END ^
// ##############################################################################################

export type passed_t = 0;
export type failed_t = 1;
export type result_t = Promise<passed_t | failed_t>;

const PASSED : passed_t = 0;
const FAILED : failed_t = 1;

async function ASSERT(octokit: Octokit, username: string, following: 'following' | 'not-following') : result_t {
  try {
    const response = await octokit.request('GET /user/following/{username}', {
      username: username
    })
    if (response.status === 204 && following === 'following') {
      return PASSED
    } else {
      return FAILED
    }
  } catch (err: unknown) {
    if (err instanceof RequestError) {
      if (err.response?.status === 404 && following === 'not-following') {
        return PASSED
      }
    }
    return FAILED
  }
}

async function ASSERT_ALWAYS_FAIL() : result_t {
  return FAILED
}

async function ASSERT_ALWAYS_PASS() : result_t {
  return PASSED
}

async function test() {
  console.log('--------------------------------');

  const test_name = [];
  const results: Array<passed_t | failed_t> = [];
  let verdict = PASSED;

  // ##############################################################################################
  // EDIT ZONE : START v

  // test asserts - add tests here
  
  test_name.push('empty test');
  results.push(await ASSERT_ALWAYS_PASS()); // there is no tests yet

  // EDIT ZONE : END ^
  // ##############################################################################################

  // check if test_name and results array length match.
  if (test_name.length !== results.length) {
    throw new Error(`\nverdict value of : ${verdict} : test_name and results is not equal in length`);
  }

  // get verdict
  for (let i = 0; i < results.length; ++i) {
    const current_result = (results[i] === PASSED) ? 'PASSED' : 'FAILED';
    console.log(`   ${current_result} : ${test_name[i]}`)
    verdict |= results[i];
  }

  // final verdict
  console.log('-----------------------------');
  if (verdict === PASSED) {
    console.log(' Verict : PASSED');
  } else {
    console.log(' Verict : FAILED');
    throw new Error(`\nverdict value of : ${verdict}`);
  }
}

test();