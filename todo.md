# INITIAL TODOs

## [ ] - Finishing CLI app
- [ ] - `main()` Function for CLI app, create the flow of the CLI app.
- [ ] - Setup CLI when installing with node **NPM**

## Tidying Up

Do all this only before after finishing all the main bullets above.

- [ ] - finish README documentation.
- [ ] - isolate and modularize the functions.
- [ ] - apply `standard.js` to the code style.

## Future Additional

Add additional functionalities here in the future

- [ ] - `follow (octokit, command, list)` - `command` all `list` of the authenticated `octokit` user.
    - `command` : `follow` | `unfollow`
    - `list`    : LIST_OF_GITHUB_USER
- [ ] - `followStargazers (octokit: Octokit, repo: String)` - follow all stargazers of a repo
- [ ] - `follow (octokit: Octokit, user: String, target: String, command: String)` - `command` all `targets` of the `user`.
    - `user` : start.
    - `targets` : `followers` | `followings`
    - `command` : `follow` | `unfollow`
- [ ] - `followDFS (octokit: Octokit, user: String, targets: String, command: String)` - `command` all `targets` of the `user`.
    - `user` : root/starting point of the DFS.
    - `targets` : `followers` | `followings`
    - `command` : `follow` | `unfollow`
- [ ] - `followBFS (octokit: Octokit, user: String, targets: String, command: String)` - `command` all `targets` of the `user`.
    - `user` : root/starting point of the BFS.
    - `targets` : `followers` | `followings`
    - `command` : `follow` | `unfollow`