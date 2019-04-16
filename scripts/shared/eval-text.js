function evalText(text) {
  const fnStr = `return ${text};`;
  return new Function(fnStr)();
}

exports.evalText = evalText;
