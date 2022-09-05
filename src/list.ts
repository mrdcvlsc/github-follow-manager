import { Octokit } from "@octokit/core";
import { asyncSetTimeout } from "./actions";
import { Endpoints } from "@octokit/types";

/** Argument Type of the `options` parameter of all the methods of the `List` class. */
export type list_options_t = {
  page?: number;
  per_page?: number;
  sleep?: number;
  retryAfter?: number;
};

/** Argument Type of the `target` parameter of the `List.user` and `List.authUser` methods of the `List` class. */
export type list_user_target_t = "followers" | "following";

/** Argument Type of the `target` parameter of the `List.repo` method of the `List` class. */
export type list_repo_target_t = "stargazers" | "subscribers";

/** Response Type of the `List.user` method of the `List` class. */
export type list_user_response_t =
  | Endpoints["GET /user/followers"]["response"]
  | Endpoints["GET /user/following"]["response"];

/** Response Type of the `List.authUser` method of the `List` class. */
export type list_auth_user_response_t =
  | Endpoints["GET /users/{username}/followers"]["response"]
  | Endpoints["GET /users/{username}/following"]["response"];

/** Response Type of the `List.repo` method of the `List` class. */
export type list_repo_response_t =
  | Endpoints["GET /repos/{owner}/{repo}/stargazers"]["response"]
  | Endpoints["GET /repos/{owner}/{repo}/subscribers"]["response"];

/** General Response Type of all the methods of the `List` class. */
export type list_response_t =
  | list_user_response_t
  | list_auth_user_response_t
  | list_repo_response_t;

/** Argument Type for the **first two parameters** of the `List.authUser` method or the `List` class. */
export type list_auth_arg_array_t = [Octokit, list_user_target_t];

/** Argument Type for the **first three parameters** of the `List.user` method or the `List` class. */
export type list_user_arg_array_t = [Octokit, string, list_user_target_t];

/** Argument Type for the **first three parameters** of the `List.repo` method or the `List` class. */
export type list_repo_arg_array_t = [Octokit, string, string];

/** General Argument Type for basic arguments of all the methods of the `List` class,
 * but the **`options` parameter is excluded!**
 */
export type list_arg_array_t =
  | list_auth_arg_array_t
  | list_user_arg_array_t
  | list_repo_arg_array_t;

/** Provides methods that returns a **List of Users** / **Array**. */
export class List {
  /** Get the list of **followers** or **following** of the **authenticated user**.
   *
   * @param octokit instance of `Octokit` class.
   *
   * @param target `string` with value of either `'followers'` or `'following'`.
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request (**default `2`**).
   *
   * @param options.page **optional** page **index** `number` (**default `1`**).
   *
   * @param options.per_page **optional** max `number` of **target**s in a **page
   * index**, (**default `100`**).
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60`**).
   *
   * @returns array of `follower` | `following` of the `Octokit` **authenticated user**.
   */
  public static async authUser(
    octokit: Octokit,
    target: list_user_target_t,
    options: list_options_t = {}
  ): Promise<list_user_response_t> {
    console.log(
      `  Getting your ${target} : page=${options.page ?? 1}, per_page=${
        options.per_page ?? 100
      }`
    );
    const response = await octokit.request(`GET /user/${target}`, {
      page: options.page ?? 1,
      per_page: options.per_page ?? 100,
      headers: {
        "Retry-After": options.retryAfter ?? 60,
      },
    });
    if (response.data?.length === 0) {
      console.log("  > the pages ends here, no more users found\n");
    }
    await asyncSetTimeout((options.sleep ?? 2) * 1000);
    return response;
  }

  /** Get the list of **followers** or **following** of the **selected user**.
   *
   * @param octokit **instance** of `Octokit` class.
   *
   * @param username github account name of the **selected user**.
   *
   * @param target `string` with value of either `'followers'` or `'following'`.
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request (**default `2`**).
   *
   * @param options.page **optional** page **index** `number` (**default `1`**).
   *
   * @param options.per_page **optional** max `number` of **target**s in a **page
   * index**, (**default `100`**).
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60`**).
   *
   * @returns array of `follower` | `following` of the **selected user**.
   */
  public static async user(
    octokit: Octokit,
    username: string,
    target: list_user_target_t,
    options: list_options_t = {}
  ): Promise<list_auth_user_response_t> {
    console.log(
      `  Getting ${target} of ${username} : page=${
        options.page ?? 1
      }, per_page=${options.per_page ?? 100}`
    );
    const response = await octokit.request(`GET /users/{username}/${target}`, {
      username: username,
      page: options.page ?? 1,
      per_page: options.per_page ?? 100,
      headers: {
        "Retry-After": options.retryAfter ?? 60,
      },
    });
    if (response.data?.length === 0) {
      console.log("  > the pages ends here, no more users found\n");
    }
    await asyncSetTimeout((options.sleep ?? 2) * 1000);
    return response;
  }

  /** Get the list of **stargzers** or **watchers** of a certain **repo**.
   *
   * @param octokit instance of `Octokit` class.
   *
   * @param owner `string` : username of the repository owner.
   *
   * @param repo `string` : name of the repository.
   *
   * @param target `string` with value of either `'stargazers'` or `'subscribers'`.
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request (**default `2`**).
   *
   * @param options.page **optional** page **index** `number` (**default `1`**).
   *
   * @param options.per_page **optional** max `number` of **target**s in a **page
   * index**, (**default `100`**).
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60`**).
   *
   * @returns array of stargazers or watchers of a selected repository.
   */
  public static async repo(
    octokit: Octokit,
    owner: string,
    repo: string,
    target: list_repo_target_t,
    options: list_options_t = {}
  ): Promise<list_repo_response_t> {
    console.log(
      `  Getting stargazers of ${owner}/${repo} : page=${
        options.page ?? 1
      }, per_page=${options.per_page ?? 100}`
    );
    const response = await octokit.request(
      `GET /repos/{owner}/{repo}/${target}`,
      {
        owner: owner,
        repo: repo,
        page: options.page ?? 1,
        per_page: options.per_page ?? 100,
        headers: {
          "Retry-After": options.retryAfter ?? 60,
        },
      }
    );
    if (response.data?.length === 0) {
      console.log("  > the pages ends here, no more users found\n");
    }
    await asyncSetTimeout((options.sleep ?? 2) * 1000);
    return response;
  }
}
