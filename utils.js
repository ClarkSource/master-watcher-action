exports.shortenString = (string, max) => {
  if (string && string.length > max) {
    return `${string
      .slice(0, max)
      .split(" ")
      .slice(0, -1)
      .join(" ")}...`;
  }

  return string;
};

exports.firstLineString = string => {
  return string ? string.split("\n")[0] : string;
};
