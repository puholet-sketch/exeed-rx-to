(() => {
  const burger = document.querySelector("[data-burger]");
  const nav = document.querySelector("[data-nav]");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("nav--open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("nav--open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      panels.forEach((p) => {
        p.hidden = p.getAttribute("data-panel") !== id;
      });
    });
  });

  const tipify = (root = document) => {
    root.querySelectorAll(".tip").forEach((el) => {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      if (!el.hasAttribute("role")) el.setAttribute("role", "button");
    });
  };
  tipify();

  /** Badge kinds: z = замена, p = проверка/осмотр, r = рекомендация */
  const B = {
    oil: { t: "Моторное масло + масляный фильтр", a: "z", l: "замена" },
    airZ: { t: "Воздушный фильтр двигателя", a: "z", l: "замена" },
    airP: { t: "Воздушный фильтр двигателя", a: "p", l: "проверка" },
    cabin: { t: "Салонный фильтр", a: "z", l: "замена" },
    plugsZ: { t: "Свечи зажигания (4 шт.)", a: "z", l: "замена" },
    plugsP: {
      t: "Свечи зажигания <small>(если уже меняли на прошлом 30-тысячном шаге)</small>",
      a: "p",
      l: "проверка",
    },
    brake: {
      t:
        '<span class="tip" data-tip="DOT 4. Меняют каждые 40 000 км или 2 года — что раньше. Нужна прокачка контура, в т.ч. с учётом ABS.">Тормозная жидкость</span>',
      a: "z",
      l: "замена",
    },
    coolant: {
      t: "Охлаждающая жидкость (~100 тыс. / 3 года)",
      a: "z",
      l: "замена",
    },
    atf: {
      t:
        '<span class="tip" data-tip="Для 7DCT — Sinopec DCTF-GS ~5–5,2 л. Для 8AT Aisin — ATF AW-1 ~7 л. Тип КПП на этом авто ещё не подтверждён.">Жидкость АКПП / DCT</span>',
      a: "z",
      l: "замена",
    },
    inspect: {
      t: "Колодки / диски, пыльники ШРУС, подвеска, течи",
      a: "p",
      l: "осмотр",
    },
    levels: {
      t: "Уровень ОЖ и жидкости КПП, ремень навесного, АКБ, шины",
      a: "p",
      l: "проверка",
    },
    rotate: {
      t: "Перестановка колёс, давление (в т.ч. запаска)",
      a: "r",
      l: "рек.",
    },
    diag: {
      t: "Диагностика ошибок, сброс сервисного интервала",
      a: "r",
      l: "рек.",
    },
    xfer: {
      t: "Раздатка / задний редуктор — уровень и течи",
      a: "p",
      l: "проверка",
    },
  };

  const baseEvery = (n) => {
    const air = n === 0 ? B.airP : B.airZ;
    const plugs = n > 0 && n % 3 === 0 ? B.plugsZ : B.plugsP;
    const items = [B.oil, air, B.cabin];
    if (n > 0 && n % 4 === 0) items.push(B.brake);
    items.push(plugs);
    if (n > 0 && n % 6 === 0) items.push(B.atf);
    if (n === 10) items.push(B.coolant);
    items.push(B.inspect, B.levels, B.rotate);
    if (n > 0 && n % 6 === 0) items.push(B.xfer, B.diag);
    return items;
  };

  const notes = {
    0: "Первое обслуживание после обкатки. Воздушный фильтр чаще только проверяют; масло и салонный — замена.",
    3: "Первая замена свечей (каждые 30 тыс.). Базовый пакет фильтров и масла.",
    4: "Сделайте, если ТО-4 ещё не закрывали при ~42 тыс. км. Свечи обычно только проверяют после замены на ТО-3.",
    6: "Крупное ТО: свечи + жидкость коробки. Сначала определите 7DCT или 8AT.",
    8: "Повтор замены тормозной жидкости (каждые 40 тыс. / 2 года).",
    9: "Снова замена свечей (90 тыс.).",
    10: "Около этой отметки — замена ОЖ по сроку ~100 тыс. / 3 года (сверить книжку).",
    12: "Крупный узел: свечи + снова жидкость КПП + тормозная по циклу 40 тыс.",
    15: "Замена свечей на 150 тыс. Дальше цикл повторяется тем же правилом.",
  };

  const catalog = {};
  for (let n = 0; n <= 15; n += 1) {
    const km = n === 0 ? 5000 : n * 10000;
    const months = n === 0 ? 2 : n * 12;
    catalog[n] = {
      title: `ТО-${n} · ${km.toLocaleString("ru-RU")} км`,
      lead:
        n === 4
          ? "Догон при пробеге ~42 тыс. км. Базовый пакет фильтров и масла плюс замена тормозной жидкости (каждые 40 тыс. или 2 года)."
          : `Регламентная точка ${km.toLocaleString("ru-RU")} км / ${months} мес. (что наступит раньше). Состав собран по типовым дилерским таблицам EXEED RX.`,
      km: `${km.toLocaleString("ru-RU")} км · ${months} мес.`,
      note: notes[n] || "Базовый пакет масла и фильтров плюс проверки по списку.",
      items: baseEvery(n),
    };
  }

  const titleEl = document.querySelector("[data-detail-title]");
  const leadEl = document.querySelector("[data-detail-lead]");
  const kmEl = document.querySelector("[data-detail-km]");
  const noteEl = document.querySelector("[data-detail-note]");
  const listEl = document.querySelector("[data-detail-list]");
  const nodes = Array.from(document.querySelectorAll("[data-to]"));

  const renderTo = (n) => {
    const data = catalog[n];
    if (!data || !listEl) return;
    if (titleEl) titleEl.textContent = data.title;
    if (leadEl) leadEl.textContent = data.lead;
    if (kmEl) kmEl.textContent = data.km;
    if (noteEl) noteEl.textContent = data.note;

    listEl.innerHTML = data.items
      .map(
        (item) => `
      <li>
        <span class="work-list__text">${item.t}</span>
        <span class="badge badge--${item.a}">${item.l}</span>
      </li>`
      )
      .join("");
    tipify(listEl);

    nodes.forEach((btn) => {
      const id = Number(btn.getAttribute("data-to"));
      btn.setAttribute("aria-selected", String(id === n));
    });
  };

  nodes.forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = Number(btn.getAttribute("data-to"));
      renderTo(n);
      const detail = document.getElementById("detail");
      if (detail && window.matchMedia("(max-width: 899px)").matches) {
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  renderTo(4);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }
})();
