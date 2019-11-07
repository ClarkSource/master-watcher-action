# master-watcher-action

This action should be launched after check_suite completed and it sends slack notification with results of build.
Check example at `.github/workflow/.example`

### Setings

`slack-token` - token for slack app, set it via `SLACK_TOKEN` in your project settings.
`slack-channel` - channel where notifications will be sent.
`track-success` - all results will be sent if true, otherwise only failed.
