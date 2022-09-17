import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";

export type actions_option_t = {
  retryAfter?: number;
  sleep?: number;
};

export type follow_response_t =
  Endpoints["PUT /user/following/{username}"]["response"];

export type unfollow_response_t =
  Endpoints["DELETE /user/following/{username}"]["response"];

export type block_response_t =
  Endpoints["PUT /user/blocks/{username}"]["response"];

export type unblock_response_t =
  Endpoints["DELETE /user/blocks/{username}"]["response"];

export type actions_method_response_t =
  | Promise<follow_response_t>
  | Promise<unfollow_response_t>
  | Promise<block_response_t>
  | Promise<unblock_response_t>;

export type actions_method_t = (
  octokit: Octokit,
  user: string,
  options?: actions_option_t
) => actions_method_response_t;

export async function asyncSetTimeout(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), milliseconds);
  });
}

export class Actions {
  /** follow a given user - ***BEWARE! FOLLOW REQUEST ARE MORE SUBJECTED TO AGRESSIVE SECONDARY RATE LIMITING!***.
   *
   * @param octokit `Octokit` instance.
   *
   * @param user github account to be followed.
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request (**default `2`**).
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60`**).
   */
  public static async follow(
    octokit: Octokit,
    user: string,
    options: actions_option_t = {}
  ): Promise<follow_response_t> {
    const response = await octokit.request("PUT /user/following/{username}", {
      username: user,
      headers: {
        "Retry-After": options.retryAfter ?? 60,
      },
    });
    console.log("    -> followed:", user);
    await asyncSetTimeout((options.sleep ?? 2) * 1000);
    return response;
  }

  /** unfollow a given user.
   *
   * @param octokit `Octokit` instance.
   *
   * @param user github account to be followed.
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request (**default `1`**).
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60`**).
   */
  public static async unfollow(
    octokit: Octokit,
    user: string,
    options: actions_option_t = {}
  ): Promise<unfollow_response_t> {
    const response = await octokit.request(
      "DELETE /user/following/{username}",
      {
        username: user,
        headers: {
          "Retry-After": options.retryAfter ?? 60,
        },
      }
    );
    console.log("    -> unfollowed:", user);
    await asyncSetTimeout((options.sleep ?? 1) * 1000);
    return response;
  }

  /** block a given user - ***BEWARE! BLOCK REQUEST ARE MORE SUBJECTED TO AGRESSIVE SECONDARY RATE LIMITING!***.
   *
   * @param octokit `Octokit` instance.
   *
   * @param user github account to be blocked.
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request (**default `2`**).
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60`**).
   */
  public static async block(
    octokit: Octokit,
    user: string,
    options: actions_option_t = {}
  ): Promise<block_response_t> {
    const response = await octokit.request("PUT /user/blocks/{username}", {
      username: user,
      headers: {
        "Retry-After": options.retryAfter ?? 60,
      },
    });
    console.log("    -> blocked:", user);
    await asyncSetTimeout((options.sleep ?? 2) * 1000);
    return response;
  }

  /** unblock a given user.
   *
   * @param octokit `Octokit` instance.
   *
   * @param user github account to be unblocked.
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request (**default `2`**).
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60`**).
   */
  public static async unblock(
    octokit: Octokit,
    user: string,
    options: actions_option_t = {}
  ): Promise<unblock_response_t> {
    const response = await octokit.request("DELETE /user/blocks/{username}", {
      username: user,
      headers: {
        "Retry-After": options.retryAfter ?? 60,
      },
    });
    console.log("    -> unblocked:", user);
    await asyncSetTimeout((options.sleep ?? 2) * 1000);
    return response;
  }
}
