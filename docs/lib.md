# **github-follow-manager - classes**

This repo provides **five** basic **class**, that **only**
contains **static methods**, and **static async methods**,
no constructors, no member variables and no other OOP 
properties.

## Contents

- [Compound and Element methods](#compound-and-element-methods)
- [Instantiating the Octokit class](#instantiating-the-octokit-class)
- [class User](#class-user)
- [class Actions](#class-actions)
- [class ListUsers](#class-listusers)
- [class Lookup](#class-lookup)
- [class Recipe](#class-recipe)

## **Compound and Element Methods**

These **five** basic classes can contain **two types** or 
methods.
1. **Element methods** - methods that **do not take** other
**methods** as an **argument**, they do not depend on other
methods.

2. **Compound methods** - methods that **take** other
**methods** as an **argument**, they depend on element 
methods.

<br>

## **Instantiating the `Octokit` class**

Some methods of these classes relies on an instance of the
`Octokit` class, here is an example no how we instantiate it.

```js
import { Octokit } from "@octokit/core";

const octokit = new Octokit({
    auth: PERSONAL_ACCESS_TOKEN
});
```
To get more information about [Octokit.js, click this link](https://github.com/octokit/octokit.js), it will redirect
you to the Octokit.js repository.

As you can see you need a personal access token when instantiating an Octokit class, you can create a personal
access token at GitHub, see the link below:

[GitHub > Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens) > **[Generate new Token](https://github.com/settings/tokens/new)**

These class methods use Octokit.js internally, it's also
available even though Octokit is not installed directly
with.

```js
import { Octokit } from "entry.ts"
```

<br>

## **class `User`**

```js
import { User } from 'entry.ts'
```
This class information retrieves about the authenticated user, 
it only contains two useful **element methods**:

1. Get **info** about the authenticated user.
    ```js
    const response = await User.getInfo(octokit)
    const info = response.data
    ```
2. Get the current **rate limit** information of the
 authenticated user.
    ```js
    const response = await User.getAllRates(octokit);
    const rates = response.data;
    ```
    Take note that the **secondary rate limit** of GitHub is not included here, see the [documentation](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#secondary-rate-limits) to learn more
    about the secondary rate.

<br>

## **class `Actions`**

```js
import { Actions } from 'entry.ts'
```

This class is pretty straight forward, it contains two
**element methods**:

1. Method to follow a user.
    ```js
    await Actions.follow(octokit, 'userToFollow')
    ```
2. Method to unfollow a user.
    ```js
    await Actions.unfollow(octokit, 'userToUnfollow')
    ```
**Optional Parameters**
    
We can pass an **options object**, containing options
property, as the last argument of these three methods,
the **property** of **options object** are

- **sleep** - optional delay in seconds after performing
the request.

- **retryAfter** - optional delay in seconds after hitting
the _secondary rate limit_ before performing another request.

**Example use:**

```js
await Actions.follow(octokit, 'userToFollow', {
    sleep: 10 // ten second sleep
})
```

<br>

## **class `ListUsers`**

```js
import { ListUsers } from 'entry.ts'
```
This class retrieves a page list of users, it contains three 
**element methods**:

1. Get **followers** or **following** of the authenticated user.

    ```js
    const response = await ListUsers.getAuth(octokit, 'followers')
    const followers = response.data
    ```

2. Get **followers** or **following** of a given user.
    ```js
    const response = await ListUsers.get(octokit, 'another-user', 'following')
    const following = response.data
    ```

3. Get **stargazers** of a repository.
    ```js
    const response = await ListUsers.getStargazers(octokit, 'owner', 'repo')
    const stargazers = response.data
    ```

**Optional Parameters**
    
We can pass an **options object**, containing options
property, as the last argument of these three methods,
the **property** of **options object** are

- **sleep** - optional delay in seconds after performing
the request.

- **page** - optional page index number.

- **per_page** - optional max number of targets in a page
index (min 1 - max 100).

- **retryAfter** - optional delay in seconds after hitting
the _secondary rate limit_ before performing another request.

**Example use:**

```js
const response = await ListUsers.getStargazers(octokit, 'owner', 'repo', {
    page: 7,
    per_page: 45
})
const stargazers = response.data
```

This will return the page 7 stargazers of the target
repository, where each page contains 45 users at max.

<br>

## **class `Lookup`**

```js
import { Lookup } from 'entry.ts'
```
A helper class of `Recipe`. It contains **one compound 
method** and **two element methods**:

1. The **`Lookup.createSet`** method is a **compound method**
that Creates a Set that contains the usernames of the accounts
retrieved from any `ListUsers` method.

    **Example:**

    ```js
    const LookupUserList = await Lookup.createSet(
        ListUsers.get, [octokit, 'owner', 'repo']
    )
    ```

    **First parameter** - Any methods in the `ListUsers` 
    class.

    **Second parameter** - An array that contains the
    original arguments of the chosen `ListUsers` method in
    the first argument but excludes the **options object 
    parameter**.

    **Third parameter** - the **options object** in this
    method has the same shape with the options object of the
    methods in `ListUsers` class.

2. The method **`Lookup.Found`** will perform the given
`Actions` method when a user is found.

3. The method **`Lookup.NotFound`** will perform the given
`Actions` method when a user is not found.

The use of these methods will become clear after you learn
about the `Recipe` class methods.

<br>

## **class `Recipe`**

```js
import { Recipe } from 'entry.ts'
```

This class is purely composed of **compound methods**:

1. The **`Recipe.perform`** method.

    - **First parameter** - Any methods in `Actions` class, 
    this is the action we want to perform for each user, 
    `follow` or `unfollow`.

    - **Second parameter** - Any methods in `ListUsers` class,
    all users that will be returned by the `ListUsers` method will be either `followed` or `unfollowed` base on the first parameter.

    - **Third parameter** - An array containing the original
    arguments of the chosen `ListUsers` method at the _second 
    parameter_.

    - **Fourth parameter** - An **options object**.

    As an **example**, say we want to **follow all of our
    followers** we do something like this.

    ```js
    Recipe.perform(Actions.follow, ListUsers.getAuth, [octokit, 'followers'])
    ```

2. The **`Recipe.performWithAssert`** method.

    - **First parameter** - A `Set` of type `string` 
    usernames, created using the `Lookup.createSet` method.

    - **Second parameter** - An **element method** of 
    `Lookup` class.

    - **Third parameter** - Any methods in `Actions` class.

    - **Fourth parameter** - Any methods in `ListUsers` class.

    - **Fifth parameter** - An array containing the original
    arguments of the chosen `ListUsers` method at the _Fourth 
    parameter_.

    - **Sixth parameter** - An **options object**.

    As an **example**, say that we want to **follow each 
    stargazers** of a certain repository, **if only when** 
    they are also **a follower** of **another account**, then
    we can do something like this:

    ```js
    const userlookup = await Lookup.createSet(
        ListUsers.getStargazers,
        [octokit, 'friendUser', 'followers']
    )

    await Recipe(
        userlookup,
        Lookup.Found,
        Actions.follow,
        ListUsers.getStargazers,
        [octokit, 'owner', 'repo']
    )
    ```

- **Options Object Property for the `Recipe` class**

    - **page** - optional page index `number`.

    - **page_limit** - optional index limit of requested pages, if not specified, all pages will be retrieved.

    - **per_page** - optional max `number` of targets in a page index.

    - **sleep** - optional delay in seconds after performing the request, default is equal to the default `sleep` of the `Actions` method chosen.

    - **retryAfter** - optional delay in seconds after hitting the secondary rate limit before performing another request.

    - **request_per_interval** - `number` of requests per interval.

    - **sleep_per_interval** - `minute` of sleep after request count hits the limit `requests_per_interval`.