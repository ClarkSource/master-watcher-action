const github = require("@actions/github");
const core = require("@actions/core");
const { WebClient } = require("@slack/web-api");

const web = new WebClient(core.getInput("slack-token"));
const context = github.context;

async function run() {
  const { payload } = context;
  const status = payload.check_suite.conclusion;
  const commitMessage = payload.check_suite.head_commit.message;

  const trackSuccess = core.getInput("track-success") || false;
  if (status === "pending") return;
  if (!trackSuccess && status === "success") return;

  web.chat.postMessage({
    channel: core.getInput("slack-channel"),
    text: `Build resulted with ${status} on master: ${commitMessage}`
  });
}
try {
  run();
} catch (e) {
  console.log(e);
}
