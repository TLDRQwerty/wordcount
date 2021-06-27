const el = { t: '#t', result: '#result' };

function leave(e) {
  document.body.classList.remove('over');
}

function over(e) {
  e.preventDefault();
  document.body.classList.add('over');
}


/**
 * @param {DragEvent} e
 */
async function drop(e) {
  e.preventDefault();

  const regexString = Object.keys(handlers).join('|');
  const droppedType = e.dataTransfer.types.join(' ').match(regexString);
  const handlerFunc = handlers[droppedType];
  if (handlerFunc) {
    el.t.value = await handlerFunc(e.dataTransfer);
    updateWordCount();
  }
}

function updateWordCount(e) {
  const words = el.t.value.trim().match(/\S+/g);
  el.result.textContent = words ? words.length : 0;
}

/**
 * @param {File} file
 */
function loadFile(file) {
  const fr = new window.FileReader();
  return new Promise((resolve, reject) => {
    fr.onerror = reject;
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsText(file);
  });
}

const handlers = {
  Files: handleFileDrag,
  'text/plain': handleTextDrag,
};

/**
 * @param {DataTransfer} dataTransfer
 * @return {string}
 */
async function handleFileDrag(dataTransfer) {
  const f = Array.from(dataTransfer.files).map(f => loadFile(f));
  const fileContents = await Promise.all(f);
  return fileContents.join('\n');
}

/**
 * @param {DataTransfer} dataTransfer
 * @returns {string}
 */
function handleTextDrag(dataTransfer) {
  return dataTransfer.getData('text/plain');
}

function setupEl() {
  for (const key of Object.keys(el)) {
    el[key] = document.querySelector(el[key]);
  }
}

function init() {
  setupEl();

  el.t.addEventListener('input', updateWordCount);
  document.body.addEventListener('dragover', over);
  document.body.addEventListener('drop', drop);
  document.body.addEventListener('drop', leave);
  document.body.addEventListener('dragleave', leave);
}

window.addEventListener('load', init);
