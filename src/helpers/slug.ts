export const slugGenerator = (title: string) =>
  title.replace(/ /gi, "-") + "-" + new Date().valueOf();
