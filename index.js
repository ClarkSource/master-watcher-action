const github = require("@actions/github");
const core = require("@actions/core");
const { WebClient } = require("@slack/web-api");
const { shortenString } = require("./utils");

const web = new WebClient(core.getInput("slack-token"));
const octokit = new github.GitHub(core.getInput("repo-token"));
const context = github.context;

async function run() {
  console.log("-------------------------------------");
  console.log(context);
  console.log("-------------------------------------");

  const { payload, repo } = context;

  const { check_suite: checkSuite } = payload.check_suite;
  const {
    conclusion: status,
    head_commit: commit,
    id: checkSuiteId
  } = checkSuite;
  const commitHeader = shortenString(commit.message, 50);
  const repoUrl = payload.repository.html_url;
  const commitUrl = `${repoUrl}/commit/${commit.id}`;

  const trackSuccess = core.getInput("track-success") || false;
  if (status === "neutral") return;

  const statusGreen = status === "success";
  if (!trackSuccess && statusGreen) return;

  const greenIcon = core.getInput("green-icon") || ":green_heart:";
  const redIcon = core.getInput("red-icon") || ":red_circle:";
  const statusWord = statusGreen ? "succeeded" : "failed";

  const { data: checkRuns } = await octokit.checks.listForSuite({
    ...repo,
    checkSuiteId
  });

  console.log(checkRuns);

  web.chat.postMessage({
    as_user: false,
    icon_emoji: statusGreen ? greenIcon : redIcon,
    channel: core.getInput("slack-channel"),
    text: `*<${commitUrl}|${commitHeader}>*\n*Build ${statusWord} on <${repoUrl}/commits/master|master branch>.*\nLinks to Github TBA`
  });
}
try {
  run();
} catch (e) {
  console.log(e);
}
