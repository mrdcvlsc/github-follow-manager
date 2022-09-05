import { Octokit } from "@octokit/core";
import { asyncSetTimeout } from "./actions";
import { Endpoints } from "@octokit/types";

export type AllRates = Endpoints["GET /rate_limit"]["response"];

export type Rate = {
  limit: number;
  used: number;
  remaining: number;
  reset: number;
};

const RATE_LIMIT_THREASHOLD = 0.04; // 4%

export class User {
  /** returns the authenticated user of the Octokit instance. */
  public static async getInfo(octokit: Octokit) {
    return await octokit.request("GET /user", {});
  }

  /** returns the REST api rate limit of the authenticated user. */
  public static async getRate(octokit: Octokit): Promise<Rate> {
    const response = await octokit.request("GET /rate_limit", {});
    return response.data.rate;
  }

  /** returns the REST api rate limit of the authenticated user. */
  public static async getAllRates(octokit: Octokit): Promise<AllRates> {
    return await octokit.request("GET /rate_limit");
  }

  public static subtractRate(rate: Rate, size = 1) {
    rate.used += size;
    rate.remaining -= size;
  }

  public static async sleepOnLowRateLimit(rate: Rate, msg = "") {
    if (rate.remaining <= rate.limit * RATE_LIMIT_THREASHOLD) {
      console.log(`\n\n${msg}`);
      console.log(
        "\n!!!! GITHUB REMAINING RATE LIMIT IS LOWER THAN THE SET THREASHOLD !!!!\n"
      );
      console.log("> the program will continue after an hour...");
      await asyncSetTimeout(1000 * 60 * 60);
    }
  }
}
