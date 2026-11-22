const app = window.Telegram?.WebApp;
app?.ready();
const root = new URL(document.documentElement.dataset.root, location.href);
const update = document.querySelector('#update');
document.querySelectorAll('a[data-project]').forEach(link => {
  link.addEventListener('click', event => {
    if (!app?.initData || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    app.openLink(link.href);
  });
});

let checking = false;
async function checkVersion() {
  if (!update || document.hidden || checking) return;
  checking = true;
  try {
    const response = await fetch(new URL('version.json', root), {cache: 'no-store'});
    if (!response.ok) return;
    const version = await response.json();
    if (version.sha === document.documentElement.dataset.sha) return;
    update.hidden = false;
    update.onclick = () => {
      const path = location.pathname.slice(root.pathname.length);
      const url = !path || version.pages.includes(path) ? new URL(location.href) : new URL(root);
      url.searchParams.set('v', version.sha.slice(0, 12));
      location.replace(url);
    };
  } catch {
    // Keep the current page readable during a connection interruption.
  } finally {
    checking = false;
  }
}
document.addEventListener('visibilitychange', checkVersion);
app?.onEvent?.('activated', checkVersion);
window.addEventListener('pageshow', checkVersion);
setInterval(checkVersion, 60000);

const library = document.querySelector('.library');
if (library) {
  const filter = library.querySelector('.filter');
  const input = filter.querySelector('input');
  const status = library.querySelector('.results');
  filter.hidden = false;
  input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase();
    let count = 0;
    library.querySelectorAll('.section').forEach(section => {
      let visible = 0;
      section.querySelectorAll('li').forEach(row => {
        row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
        if (!row.hidden) visible++;
      });
      section.hidden = visible === 0;
      count += visible;
    });
    status.hidden = query === '';
    status.textContent = count ? `Найдено материалов: ${count}` : 'Материалов с таким названием нет.';
  });
}
