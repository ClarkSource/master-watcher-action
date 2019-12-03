try {
  const github = require("@actions/github");
  const githubContext = github.context;

  const { state } = githubContext.payload;
  if (state !== "failure" && state !== "error") {
    console.log(`State is ${state}, no notification required.`);
    return;
  }

  const core = require("@actions/core");
  const slackToken = core.getInput("slack-token");
  const slackChannel = core.getInput("slack-channel");

  const { WebClient } = require("@slack/web-api");
  const { shortenString, firstLineString, reducedSha } = require("./utils");

  const {
    commit,
    repository,
    description,
    context,
    target_url: targetUrl,
    avatar_url: avatarUrl
  } = githubContext.payload;

  const { html_url: commitUrl, commit: commitData } = commit;
  const { html_url: repositoryUrl } = repository;
  const commitHeader = shortenString(firstLineString(commitData.message), 50);
  const masterUrl = `${repositoryUrl}/commits/master`;

  const slackbot = new WebClient(slackToken);
  slackbot.chat.postMessage({
    as_user: false,
    channel: slackChannel,
    text: `${commitHeader} [<${commitUrl}|reducedSha(commit.sha)> on <${masterUrl}|master>]`,
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
} catch (e) {
  console.log(e);
}
