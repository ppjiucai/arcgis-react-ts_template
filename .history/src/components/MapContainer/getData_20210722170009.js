const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
module.exports = {
  site: resolveApp('package.json'),
};