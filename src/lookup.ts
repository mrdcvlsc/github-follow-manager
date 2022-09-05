import { list_arg_array_t } from "./list";
import { recipe_options_t, _breakCheck } from "./recipe";
import { User } from "./user";

export type lookup_method_t = (logic: boolean) => boolean;

export class Lookup {
  /** Creates a `Set` of `string` to be used as a lookup by `Recipe.performWithAssert`.
   *
   * @param ListUsersMethod any static methods of `ListUsers` class.
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
   * @returns `Set` of `string` username. */
  public static async createSet(
    ListUsersMethod: any,
    ListUsersMethodArgs: list_arg_array_t,
    options: recipe_options_t = {}
  ): Promise<Set<string>> {
    console.log("creating lookup list...");
    const lookup: Set<string> = new Set();
    const rate = await User.getRate(ListUsersMethodArgs[0]);

    const counters = {
      page: options.page ?? 1,
    };

    while (true) {
      await User.sleepOnLowRateLimit(
        rate,
        `SLEEP ON: creating lookup... | page=${counters.page}`
      );
      const response = await ListUsersMethod(...ListUsersMethodArgs, {
        page: counters.page,
        per_page: options.per_page,
        retryAfter: options.retryAfter ?? 60 * 60,
        sleep: options.sleep,
      });

      if (_breakCheck(rate, counters, options, response)) {
        break;
      }

      for (let i = 0; i < response.data.length; ++i) {
        console.log(
          `    +-> Adding '${response.data[i].login}' to the lookup list`
        );
        lookup.add(response.data[i].login);
      }
      counters.page++;
    }

    console.log("lookup list created.\n");
    return lookup;
  }

  public static NotFound(logic: boolean): boolean {
    return !logic;
  }
  public static Found(logic: boolean): boolean {
    return logic;
  }
}
