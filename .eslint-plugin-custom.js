module.exports = {
  rules: {
    'ignore-pipe': {
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'observable' &&
              node.callee.property.name === 'pipe'
            ) {
              context.report({
                node,
                message: 'Ignoring pipe content for Prettier',
                fix(fixer) {
                  // Fix logic to ignore this node for Prettier
                  return fixer.replaceText(
                    node,
                    `/* prettier-ignore */\n${context.getSourceCode().getText(node)}`
                  );
                },
              });
            }
          },
        };
      },
    },
  },
};