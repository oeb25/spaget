/// <reference path="node_modules/web-ext-types/global/index.d.ts" />

const search = document.getElementById("search") as HTMLInputElement;
const tabsContainter = document.getElementById("tabs")!;

const run = async () => {
  const t = await browser.tabs.query({});

  let selected = 0;
  let numShown = t.length;

  search.focus();
  search.onblur = e => setTimeout(() => window.close(), 500);

  search.onkeydown = e => {
    const DOWN = 40,
      UP = 38,
      ENTER = 13;
    const ONE = 49;
    const NINE = ONE + 9;
    if (e.keyCode == UP) {
      e.preventDefault();
      selected = (selected + numShown - 1) % numShown;
      updateSelected();
    } else if (e.keyCode == DOWN) {
      e.preventDefault();
      selected = (selected + numShown + 1) % numShown;
      updateSelected();
    } else if (e.keyCode == ENTER) {
      const s = updateSelected()!;
      browser.tabs.update(s.tab.id, { active: true });
      window.close();
    }
  };
  search.oninput = e => {
    selected = 0;
    numShown = 0;
    const q = search.value.toLowerCase();
    for (const tab of tabs) {
      if (
        tab.tab.title!.toLowerCase().includes(q) ||
        tab.tab.url!.toLowerCase().includes(q)
      ) {
        if (numShown == 0) {
          tab.link.classList.add("selected");
          // browser.tabs.update(tab.tab.id, { active: true });
          // search.focus();
        }
        numShown += 1;
        tab.link.classList.remove("hide");
      } else {
        tab.link.classList.add("hide");
      }
    }
  };

  const tabs = t.map((tab, j) => {
    const link = document.createElement("a");
    link.classList.add("tab");
    const text = document.createElement("span");
    const img = document.createElement("img");
    img.src = tab.favIconUrl!;
    img.width = img.height = 32;
    text.innerText = `${tab.title}`;
    link.href = tab.url!;
    link.append(img, text);
    tabsContainter.appendChild(link);

    if (tab.active) {
      selected = j;
    }

    link.onclick = e => {
      e.preventDefault();
      browser.tabs.update(tab.id, { active: true });
      window.close();
    };

    return {
      tab,
      link
    };
  });

  const updateSelected = (): typeof tabs[0] | null => {
    let i = 0;
    let s: typeof tabs[0] | null = null;
    for (const tab of tabs) {
      tab.link.classList.remove("selected");
      if (!tab.link.classList.contains("hide")) {
        if (i == selected % numShown) {
          tab.link.classList.add("selected");
          tab.link.parentElement?.scrollTo({
            top: tab.link.offsetTop - tab.link.parentElement!.clientHeight / 2,
            behavior: "smooth"
          });
          s = tab;
        }
        i++;
      }
    }
    return s;
  };

  updateSelected();
};
run();
