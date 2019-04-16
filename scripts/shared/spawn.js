const _spawn = require("child_process").spawn;
exports.spawn = command => {
  const [name, ...args] = command.split(" ");
  return _spawn(name, args, { stdio: "inherit" });
};
