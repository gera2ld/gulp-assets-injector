const path = require('path');
const through = require('through2');

function injectCSS(html, file, options) {
  const injected = options.link
    ? `<link rel="stylesheet" href="${options.link(html.path, file.path)}">`
    : `<style>${file.content}</style>`;
  return html.content.replace('</head>', m => `${injected}\n${m}`);
}
function injectJS(html, file, options) {
  const injected = options.link
    ? `<script src="${options.link(html.path, file.path)}"></script>`
    : `<script>${file.content}</script>`;
  return html.content.replace('</body>', m => `${injected}\n${m}`);
}

function getLink(htmlPath, assetPath) {
  return path.relative(path.dirname(htmlPath), assetPath);
}

const injectors = {
  '.css': injectCSS,
  '.js': injectJS,
};
const defaultOptions = {
  link: true,
  filter: (htmlPath, assetPath) => path.resolve(path.dirname(htmlPath)) === path.resolve(path.dirname(assetPath)),
};

module.exports = function () {
  function collect() {
    return through.obj(function (file, enc, cb) {
      const source = path.resolve(file.path);
      assets[source] = {
        file,
        path: source,
        get content() {return file.contents.toString();},
      };
      cb(null, file);
    });
  }
  function inject(options) {
    options = Object.assign({}, defaultOptions, options);
    if (options.link && typeof options.link !== 'function') options.link = getLink;
    return through.obj(function (file, enc, cb) {
      const items = Object.keys(assets)
      .filter(filepath => options.filter(file.path, filepath))
      .map(filepath => assets[filepath]);
      if (items.length) {
        let content = String(file.contents);
        items.forEach(item => {
          var inject = injectors[path.extname(item.path).toLowerCase()];
          if (inject && item.content.trim()) content = inject({
            content,
            path: file.path,
          }, item, options);
        });
        file.contents = new Buffer(content);
      }
      cb(null, file);
    });
  }
  const assets = {};
  return {collect, inject};
};
