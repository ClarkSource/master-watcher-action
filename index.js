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
  const {
    conclusion: status,
    head_commit: commit,
    id: check_suite_id
  } = payload.check_suite;

  if (status === "neutral" || status === "success") return;

  const commit_header = shortenString(commit.message, 50);
  const repo_url = payload.repository.html_url;
  const commit_url = `${repo_url}/commit/${commit.id}`;

  const { data: check_runs } = await octokit.checks.listForSuite({
    ...repo,
    check_suite_id
  });

  console.log(check_runs);

  slackMessage(
    ":red_circle:",
    `*<${commit_url}|${commit_header}>*\n*Build failed on <${repo_url}/commits/master|master branch>.*\nLinks to Github TBA`
  );
}

function slackMessage(icon_emoji, text) {
  web.chat.postMessage({
    as_user: false,
    channel: core.getInput("slack-channel"),
    icon_emoji,
    text
  });
}

try {
  run();
} catch (e) {
  console.log(e);
}
