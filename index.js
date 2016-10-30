const path = require('path');
const through = require('through2');

function injectCSS(html, file, options) {
  const injected = options.link
    ? `<link rel="stylesheet" href="${path.basename(file.path)}">`
    : `<style>${file.contents.toString()}</style>`;
  return html.replace('</head>', m => `${injected}\n${m}`);
}
function injectJS(html, file, options) {
  const injected = options.link
    ? `<script src="${path.basename(file.path)}"></script>`
    : `<script>${file.contents.toString()}</script>`;
  return html.replace('</body>', m => `${injected}\n${m}`);
}

function defaultFilter(htmlPath, assetPath) {
  return path.resolve(path.dirname(htmlPath)) === path.resolve(path.dirname(assetPath));
}

const injectors = {
  '.css': injectCSS,
  '.js': injectJS,
};
const defaultOptions = {
  file: true,
  filter: defaultFilter,
};

module.exports = function () {
  function collect() {
    return through.obj(function (file, enc, cb) {
      assets[path.resolve(file.path)] = file;
      cb(null, file);
    });
  }
  function inject(options) {
    options = Object.assign({}, defaultOptions, options);
    return through.obj(function (file, enc, cb) {
      const items = Object.keys(assets)
      .filter(filepath => options.filter(file.path, filepath))
      .map(filepath => assets[filepath]);
      if (items.length) {
        let content = String(file.contents);
        items.forEach(item => {
          var inject = injectors[path.extname(item.path).toLowerCase()];
          if (inject) content = inject(content, item, options);
        });
        file.contents = new Buffer(content);
      }
      cb(null, file);
    });
  }
  const assets = {};
  return {collect, inject};
};
