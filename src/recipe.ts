import { User } from "./user";
import { asyncSetTimeout } from "./actions";
import { Rate } from "./user";
import {
  list_arg_array_t,
  list_user_response_t,
  list_user_target_t,
} from "./list";
import { actions_method_t } from "./actions";
import { lookup_method_t } from "./lookup";

export type recipe_options_t = {
  page?: number;
  page_limit?: number;
  per_page?: number;
  retryAfter?: number;
  sleep?: number;
  request_per_interval?: number;
  sleep_per_interval?: number;
};

type counter_t = {
  page: number;
  requests?: number;
};

export function _breakCheck(
  rate: Rate,
  counters: counter_t,
  options: recipe_options_t = {},
  response: list_user_response_t
): boolean {
  User.subtractRate(rate);

  if (response.status !== 200) {
    console.error(
      `\n!!!!! Something went wrong when retreiving the page ${counters.page} !!!!!\n`
    );
  }

  if (response.data.length === 0) {
    return true;
  }

  if (options.page_limit) {
    if (counters.page >= options.page_limit) {
      console.log(`  the defined page_limit=${options.page_limit} was reached`);
      return true;
    }
  }

  return false;
}

export class Recipe {
  /** Takes two different methods, each is from the two
   * class `Actions` and `ListUsers` to perform a new task
   *
   * @param ActionsMethod any of the methods inside the `Actions` class.
   *
   * @param ListUsersMethod any of the methods inside the `ListUsers` class.
   *
   * @param ListUsersMethodArgs an array containing the arguments to be passed in
   * the chosen `ListUsersMethod`, this should **exclude the last 2 default
   * arguments** `index` and `size`.
   *
   * @param options.page **optional** page **index** `number` (**default `1`**).
   *
   * @param options.page_limit **optional** index limit of requested pages,
   * if not specified, all pages will retrieved.
   *
   * @param options.per_page **optional** max `number` of **target**s in a **page
   * index**, (**default `100`**).
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request,
   * **default** is equal to the default **`sleep`** of the **`Actions`** method chosen.
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60 * 60` 1 hour**).
   *
   * @param options.request_per_interval `number` of requests per interval, **default** is **`30`** requests.
   *
   * @param options.sleep_per_interval `minute` of sleep after request count hits the limit
   * `options.requests_per_interval`, **default** is **`10`** minutes.
   * */
  public static async perform(
    ActionsMethod: actions_method_t,
    ListUsersMethod: any,
    ListUsersMethodArgs: list_arg_array_t,
    options: recipe_options_t = {}
  ) {
    console.log(
      `preforming '${ActionsMethod.name}' on '${ListUsersMethod.name}'`
    );
    const rate = await User.getRate(ListUsersMethodArgs[0]);

    const counters = {
      page: options.page ?? 1,
      requests: 0,
    };

    // retrieve all ListUsers
    const data = [];
    while (true) {
      await User.sleepOnLowRateLimit(
        rate,
        `SLEEP ON: performIfExsist() ListUsers page=${counters.page}`
      );
      const response = await ListUsersMethod(...ListUsersMethodArgs, {
        page: counters.page,
        per_page: options.per_page,
        retryAfter: options.retryAfter ?? 60 * 60,
        sleep: options.sleep,
      });

      data.push(...response.data);

      if (_breakCheck(rate, counters, options, response)) {
        break;
      } else {
        counters.page++;
      }
    }

    console.log(`  retrieved a total of ${data.length} user accounts\n`);

    // perform Actions in the retrieved data
    for (let i = 0; i < data.length; ++i) {
      await ActionsMethod(ListUsersMethodArgs[0], data[i].login, {
        sleep: options.sleep,
        retryAfter: options.retryAfter ?? 60 * 60,
      });
      if (counters.requests >= (options.request_per_interval ?? 30)) {
        console.log(
          `${
            options.sleep_per_interval ?? 10
          } minute sleep to lower the chance of exceeding the secondary rate limit...`
        );
        counters.requests = 0;
        await asyncSetTimeout(60000 * (options.sleep_per_interval ?? 10));
      }
      counters.requests++;
    }

    console.log(
      `done preforming '${ActionsMethod.name}' on '${ListUsersMethod.name}'\n`
    );
  }

  /** Takes three different methods, each is from the three
   * class `Lookup`, `Actions` and `ListUsers` to perform a new task.
   *
   * @param Lookup `Set` of `string` created by the `Recipe.createSet`.
   *
   * @param LookupMethod any of the methods inside the `Lookup` class.
   *
   * @param ActionsMethod any of the methods inside the `Actions` class.
   *
   * @param ListUsersMethod any of the methods inside the `ListUsers` class.
   *
   * @param ListUsersMethodArgs an array containing the arguments to be passed in
   * the chosen `ListUsersMethod`, this should **exclude the last 2 default
   * arguments** `index` and `size`.
   *
   * @param options.page **optional** page **index** `number` (**default `1`**).
   *
   * @param options.page_limit **optional** index limit of requested pages,
   * if not specified, all pages will retrieved.
   *
   * @param options.per_page **optional** max `number` of **target**s in a **page
   * index**, (**default `100`**).
   *
   * @param options.sleep **optional** delay in **seconds** after performing the request,
   * **default** is equal to the default **`sleep`** of the **`Actions`** method chosen.
   *
   * @param options.retryAfter **optional** delay in **seconds** after hitting the
   * **secondary rate limit** before performing another request (**default `60 * 60` 1 hour**).
   *
   * @param options.request_per_interval `number` of requests per interval, **default** is **`30`** requests.
   *
   * @param options.sleep_per_interval `minute` of sleep after request count hits the limit
   * `options.requests_per_interval`, **default** is **`10`** minutes.
   * */
  public static async performWithAssert(
    Lookup: Set<string>,
    LookupMethod: lookup_method_t,
    ActionsMethod: actions_method_t,
    ListUsersMethod: any,
    ListUsersMethodArgs: list_arg_array_t,
    options: recipe_options_t = {}
  ) {
    console.log(
      `preformingWithAssert '${ActionsMethod.name}' on '${ListUsersMethod.name}'`
    );
    const rate = await User.getRate(ListUsersMethodArgs[0]);

    const counters = {
      page: options.page ?? 1,
      requests: 0,
    };

    // retrieve all ListUsers
    const data = [];
    while (true) {
      await User.sleepOnLowRateLimit(
        rate,
        `SLEEP ON: performIfExsist() ListUsers page=${counters.page}`
      );
      const response = await ListUsersMethod(...ListUsersMethodArgs, {
        page: counters.page,
        per_page: options.per_page,
        retryAfter: options.retryAfter ?? 60 * 60,
        sleep: options.sleep,
      });

      data.push(...response.data);

      if (_breakCheck(rate, counters, options, response)) {
        break;
      } else {
        counters.page++;
      }
    }

    console.log(`  retrieved a total of ${data.length} user accounts\n`);

    // perform Actions in the retrieved data
    for (let i = 0; i < data.length; ++i) {
      if (LookupMethod(Lookup.has(data[i].login))) {
        await ActionsMethod(ListUsersMethodArgs[0], data[i].login, {
          sleep: options.sleep,
          retryAfter: options.retryAfter ?? 60 * 60,
        });
        if (counters.requests >= (options.request_per_interval ?? 30)) {
          console.log(
            `${
              options.sleep_per_interval ?? 10
            } minute sleep to lower the chance of exceeding the secondary rate limit...`
          );
          counters.requests = 0;
          await asyncSetTimeout(60000 * (options.sleep_per_interval ?? 10));
        }
        counters.requests++;
      } else {
        console.log(
          `   +-+> user '${data[i].login}' did not satisfy the logic, and was skipped`
        );
      }
    }

    console.log(
      `done preformingWithAssert '${ActionsMethod.name}' on '${ListUsersMethod.name}'\n`
    );
  }
}
