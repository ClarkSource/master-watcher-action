# master-watcher-action

This action should be launched after any commit status update on master branch.
It sends slack message to specified channel if status is "failure" or "error".
Check example at `.github/workflow/.example`

### Settings

`slack-token` - token for slack app, set it via `SLACK_TOKEN` in your project settings.
`slack-channel` - channel where notifications will be sent.
