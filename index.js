const github = require("@actions/github");
const core = require("@actions/core");
const { WebClient } = require("@slack/web-api");

const web = new WebClient(core.getInput("slack-token"));
const context = github.context;

async function run() {
  const { payload } = context;

  const status = payload.check_suite.conclusion;
  const commit = payload.check_suite.head_commit;
  const commitMessage = commit.message;
  const repoUrl = payload.repository.html_url;
  const commitUrl = `${repoUrl}/${commit.id}`;

  const trackSuccess = core.getInput("track-success") || false;
  if (status === "neutral") return;

  const statusGreen = status === "success";
  if (!trackSuccess && statusGreen) return;

  const greenIcon = core.getInput("green-icon") || ":green_heart:";
  const redIcon = core.getInput("red-icon") || ":red_circle:";
  const statusWord = statusGreen ? "succeeded" : "failed";

  web.chat.postMessage({
    icon: statusGreen ? greenIcon : redIcon,
    channel: core.getInput("slack-channel"),
    text: `*Build ${statusWord} on <${repoUrl}/commits/master|master branch>.*\n<${commitUrl}|${commitMessage}>\nLinks to Github TBA`
  });
}
try {
  run();
} catch (e) {
  console.log(e);
}
