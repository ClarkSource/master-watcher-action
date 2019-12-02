const github = require("@actions/github");
const core = require("@actions/core");
const { WebClient } = require("@slack/web-api");
const { shortenString } = require("./utils");

const web = new WebClient(core.getInput("slack-token"));
// const octokit = new github.GitHub(core.getInput("repo-token"));
const githubContext = github.context;

// const CIRCLECI_SLUG = "circleci-checks";

// async function run() {
//   const { payload } = githubContext;
//   const {
//     conclusion: status,
//     head_commit: commit,
//     id: check_suite_id
//   } = payload.check_suite;

//   if (status === "neutral" || status === "success") return;

//   const commit_header = shortenString(commit.message, 50);
//   const repo_url = payload.repository.html_url;
//   const commit_url = `${repo_url}/commit/${commit.id}`;

//   slackMessage({
//     icon_emoji: ":red_circle:",
//     text: `*<${commit_url}|${commit_header}>*\n*Build failed on <${repo_url}/commits/master|master branch>.*`,
//     attachments: await circleciAttachments(check_suite_id)
//   });
// }

// async function circleciAttachments(check_suite_id) {
//   const { data: check_runs } = await octokit.checks.listForSuite({
//     ...githubContext.repo,
//     check_suite_id
//   });

//   const circleci_check_run = check_runs.find(check_run => {
//     return (
//       check_run.app.slug === CIRCLECI_SLUG &&
//       check_run.conclusion !== "neutral" &&
//       check_run.conclusion !== "success"
//     );
//   });

//   const circleci_regex = /\[(.+)\]\((.+)\)/;
//   return circleci_check_run.output.summary
//     .split("* ")
//     .slice(1)
//     .map(row => {
//       return row.trim().split(" - ");
//     })
//     .filter(check_run => {
//       return check_run[1] !== "Success" && check_run[1] !== "Pending";
//     })
//     .map(check_run => {
//       const match = circleci_regex.run(check_run[0]);

//       return {
//         fallback: `<${match[2]}|${match[1]}>`,
//         color: "#d30515",
//         title: match[1],
//         title_link: match[2]
//       };
//     });
// }

// function slackMessage({ icon_emoji, text, attachments }) {
//   web.chat.postMessage({
//     as_user: false,
//     channel: core.getInput("slack-channel"),
//     icon_emoji,
//     text,
//     attachments
//   });
// }

async function statusChanged() {
  const {
    state,
    commit,
    repository,
    description,
    context,
    target_url: targetUrl,
    avatar_url: avatarUrl
  } = githubContext.payload;

  if (state !== "failure" && state !== "error") return;

  const { html_url: commitUrl, commit: commitData } = commit;
  const { html_url: repositoryUrl } = repository;
  const commitHeader = shortenString(commitData.message, 50);
  const masterUrl = `${repositoryUrl}/commits/master`;

  web.chat.postMessage({
    as_user: false,
    channel: core.getInput("slack-channel"),
    text: `${commitHeader} (<${commitUrl}|commit> | <${masterUrl}|master>)`,
    attachments: [
      {
        fallback: `<${targetUrl}|${context}> - ${description}`,
        color: "#d30515",
        title: context,
        title_link: targetUrl,
        text: description,
        thumb_url: avatarUrl
      }
    ]
  });
}

try {
  statusChanged();
} catch (e) {
  console.log(e);
}
