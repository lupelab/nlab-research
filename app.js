const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw5WfmCYFJR0rQEDvtrrD_ZUhQJKrcPNRJCAKITcTh7gO-VwcUzM_jHOjW1lxAECF3_sw/exec";

const STORAGE_KEY = "nlab-prodent-research-v2";

const state = {
  started: false,
  currentKey: null,
  responseId: crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  startedAt: new Date().toISOString(),
  answers: {},
  randomized: {}
};

const brands = [
  "Colgate",
  "Oral-B",
  "Sensodyne",
  "Parodontax",
  "Close-Up",
  "PRODENT",
  "Otra",
  "No recuerdo / no sé"
];

const sections = [
  {
    id: "profile",
    number: 1,
    title: "Perfil",
    fields: [
      {
        id: "age",
        type: "radio",
        label: "¿Cuál es tu rango de edad?",
        required: true,
        options: ["Menos de 18", "18–24", "25–34", "35–44", "45–54", "55 o más"]
      },
      {
        id: "household",
        type: "checkbox",
        label: "¿Con quién vivís actualmente?",
        required: true,
        options: [
          "Vivo solo/a",
          "Pareja",
          "Hijos menores de 12 años",
          "Hijos de 12 años o más",
          "Padres/familiares",
          "Otras personas"
        ],
        exclusiveOptions: ["Vivo solo/a"]
      },
      {
        id: "purchase_role",
        type: "radio",
        label: "En tu hogar, ¿participás en la compra de productos de higiene y cuidado bucal?",
        required: true,
        options: [
          "Soy quien principalmente los compra",
          "Comparto la decisión/compra",
          "Algunas veces",
          "Casi nunca",
          "Nunca"
        ]
      }
    ]
  },

  {
    id: "habits",
    number: 2,
    title: "Hábitos",
    fields: [
      {
        id: "oral_care_first_thought",
        type: "textarea",
        label: "Cuando pensás en “cuidado bucal”, ¿qué es lo primero que se te viene a la cabeza?",
        required: false,
        placeholder: "Escribí lo primero que se te venga a la cabeza."
      },
      {
        id: "products_used",
        type: "checkbox",
        label: "¿Cuáles de estos productos utilizás habitualmente?",
        required: true,
        options: [
          "Pasta dental",
          "Cepillo dental",
          "Hilo dental",
          "Enjuague bucal",
          "Cepillos interdentales",
          "Productos especiales recomendados por odontólogos",
          "Otros",
          "Ninguno"
        ],
        exclusiveOptions: ["Ninguno"],
        otherLabel: "Otros",
        otherPlaceholder: "¿Cuál?"
      },
      {
        id: "purchase_frequency",
        type: "radio",
        label: "¿Con qué frecuencia comprás productos de cuidado bucal?",
        required: true,
        options: [
          "Varias veces al mes",
          "Aproximadamente una vez al mes",
          "Cada 2–3 meses",
          "Menos frecuentemente",
          "No soy responsable de la compra"
        ]
      },
      {
        id: "purchase_places",
        type: "checkbox",
        label: "¿Dónde los comprás habitualmente?",
        required: true,
        options: [
          "Supermercado",
          "Farmacia",
          "Minimercado",
          "Tienda de conveniencia",
          "Online",
          "Consultorio odontológico",
          "Otro"
        ],
        otherLabel: "Otro",
        otherPlaceholder: "¿Dónde?"
      }
    ]
  },

  {
    id: "category",
    number: 3,
    title: "Categoría",
    fields: [
      {
        id: "brand_recall",
        type: "textarea",
        label: "Pensando en productos de cuidado bucal, ¿qué marcas recordás?",
        help: "Podés mencionar todas las que recuerdes. No importa el orden.",
        required: true,
        placeholder: "Escribí las marcas que recuerdes."
      },
      {
        id: "top_of_mind",
        type: "text",
        label: "¿Cuál es la primera marca que se te viene a la cabeza?",
        required: true,
        placeholder: "Escribí una marca."
      },
      {
        id: "current_toothpaste_brand",
        type: "select",
        label: "¿Qué marca de pasta dental utilizás con mayor frecuencia?",
        required: true,
        options: ["Seleccionar…", ...brands],
        otherLabel: "Otra",
        otherPlaceholder: "¿Qué marca?"
      }
    ]
  },

  {
    id: "drivers",
    number: 4,
    title: "Drivers de elección",
    fields: [
      {
        id: "driver_importance",
        type: "matrix5",
        label: "¿Qué tan importantes son estos factores al elegir una marca de cuidado bucal?",
        required: true,
        left: "Nada importante",
        right: "Muy importante",
        rows: [
          "Efectividad",
          "Precio",
          "Confianza en la marca",
          "Recomendación del odontólogo",
          "Ingredientes",
          "Innovación",
          "Sabor / sensación",
          "Disponibilidad",
          "Fabricación / origen",
          "Diseño / presentación",
          "Beneficios específicos"
        ]
      },
      {
        id: "choice_weight",
        type: "checkboxMax3",
        label: "Si dos productos ofrecieran beneficios similares, ¿qué tendría más peso en tu elección?",
        required: true,
        help: "Elegí hasta 3.",
        max: 3,
        shuffle: true,
        options: [
          "Una marca que conozco hace años",
          "Recomendación de mi odontólogo",
          "Mejor precio",
          "Una fórmula o ingrediente innovador",
          "Que sea una marca paraguaya",
          "Respaldo de una empresa/laboratorio reconocido",
          "Que sea fácil de encontrar",
          "Una presentación atractiva",
          "Recomendaciones/reseñas online",
          "Otro"
        ],
        otherLabel: "Otro",
        otherPlaceholder: "¿Qué tendría peso para vos?"
      }
    ]
  },

  {
    id: "awareness",
    number: 5,
    title: "PRODENT hoy",
    fields: [
      {
        id: "prodent_awareness",
        type: "radio",
        label: "Antes de esta encuesta, ¿conocías o habías escuchado hablar de PRODENT?",
        required: true,
        options: [
          "Sí, la conozco bien",
          "Sí, me suena / conozco algo",
          "Creo haberla escuchado",
          "No",
          "No estoy seguro/a"
        ]
      }
    ]
  },

  {
    id: "perception",
    number: 6,
    title: "Percepción actual",
    condition: () => knowsProdent(),
    fields: [
      {
        id: "prodent_first_association",
        type: "textarea",
        label: "Sin pensarlo demasiado, ¿qué es lo primero que asociás con PRODENT?",
        required: true,
        placeholder: "Escribí tu primera asociación."
      },
      {
        id: "prodent_products_recall",
        type: "textarea",
        label: "¿Qué productos recordás o creés que comercializa PRODENT?",
        required: false,
        placeholder: "Podés escribir uno o varios productos."
      },
      {
        id: "prodent_associations",
        type: "matrix5",
        label: "¿Cuánto asociás actualmente a PRODENT con cada uno de estos conceptos?",
        required: true,
        left: "No la asocio",
        right: "La asocio mucho",
        rows: [
          "Medicamentos",
          "Odontología profesional",
          "Tratamiento de problemas bucales",
          "Cuidado bucal cotidiano",
          "Prevención",
          "Confianza",
          "Calidad",
          "Innovación",
          "Modernidad",
          "Accesibilidad",
          "Productos para toda la familia",
          "Respaldo profesional"
        ]
      },
      {
        id: "prodent_three_words",
        type: "text",
        label: "Si tuvieras que describir PRODENT en tres palabras, ¿cuáles serían?",
        required: false,
        placeholder: "Tres palabras."
      },
      {
        id: "consideration_pre",
        type: "scale10",
        label: "Actualmente, ¿considerarías comprar un producto PRODENT para usarlo todos los días?",
        required: true,
        left: "Definitivamente no",
        right: "Definitivamente sí"
      },
      {
        id: "consideration_pre_reason",
        type: "textarea",
        label: "¿Por qué?",
        required: false,
        placeholder: "Podés responder en una frase."
      }
    ]
  },

  {
    id: "authority",
    number: 7,
    title: "Autoridad e innovación",
    fields: [
      {
        id: "dentist_influence",
        type: "matrix5",
        label: "¿Cuánto influye un odontólogo en tu elección en estas situaciones?",
        required: true,
        left: "Nada",
        right: "Mucho",
        rows: [
          "Resolver un problema específico",
          "Elegir una pasta de uso diario",
          "Elegir un cepillo",
          "Productos infantiles",
          "Productos preventivos",
          "Productos con ingredientes que no conozco"
        ]
      },
      {
        id: "innovation_trust",
        type: "checkboxMax3",
        label: "Cuando una marca habla de un ingrediente o tecnología nueva, ¿qué necesitás para confiar?",
        required: true,
        help: "Elegí hasta 3.",
        max: 3,
        shuffle: true,
        options: [
          "Explicación sencilla de cómo funciona",
          "Recomendación de un odontólogo",
          "Respaldo científico",
          "Respaldo de un laboratorio",
          "Testimonios / reseñas",
          "Haber probado el producto",
          "Conocer previamente la marca",
          "No suelo prestar atención a ingredientes o tecnologías"
        ]
      },
      {
        id: "value_propositions",
        type: "matrix5",
        label: "¿Qué tan atractivas te resultan estas propuestas en cuidado bucal?",
        required: true,
        left: "Nada atractiva",
        right: "Muy atractiva",
        rows: [
          "Ingredientes o tecnologías innovadoras",
          "Ingredientes naturales",
          "Protección completa para todos los días",
          "Respaldo profesional",
          "Productos sustentables",
          "Buena relación precio-calidad",
          "Desarrollo / fabricación en Paraguay"
        ]
      }
    ]
  },

  {
    id: "care",
    number: 8,
    title: "Nueva etapa",
    stimulus: "PRODENT está ampliando su presencia hacia una línea de productos para el cuidado bucal cotidiano, con propuestas como pastas dentales, cepillos e hilo dental, combinando respaldo profesional con nuevas alternativas de cuidado.",
    fields: [
      {
        id: "care_credibility",
        type: "matrix5single",
        label: "¿Qué tan creíble te parece que PRODENT pueda convertirse en una marca de cuidado bucal para todos los días?",
        required: true,
        left: "Nada creíble",
        right: "Muy creíble"
      },
      {
        id: "consideration_post",
        type: "scale10",
        label: "Sabiendo esto, ¿qué tan probable sería que consideres PRODENT para tu rutina diaria?",
        required: true,
        left: "Nada probable",
        right: "Muy probable"
      },
      {
        id: "needed_to_prove",
        type: "textarea",
        label: "¿Qué tendría que demostrar PRODENT para que realmente la consideres como alternativa de uso diario?",
        required: true,
        placeholder: "Podés responder en una frase."
      },
      {
        id: "future_attributes",
        type: "checkboxMax2",
        label: "¿Qué atributos debería construir con más fuerza hacia adelante?",
        required: true,
        help: "Elegí hasta 2.",
        max: 2,
        shuffle: true,
        options: [
          "Confianza",
          "Innovación",
          "Efectividad",
          "Cercanía",
          "Modernidad",
          "Accesibilidad",
          "Respaldo profesional",
          "Cuidado",
          "Sustentabilidad",
          "Especialización"
        ]
      }
    ]
  },

  {
    id: "communication",
    number: 9,
    title: "Comunicación",
    fields: [
      {
        id: "content_interest",
        type: "checkbox",
        label: "¿Qué contenidos te resultarían útiles o interesantes?",
        required: true,
        shuffle: true,
        options: [
          "Consejos prácticos",
          "Prevención",
          "Explicaciones de odontólogos",
          "Mitos y verdades",
          "Explicaciones sobre ingredientes",
          "Novedades / innovación",
          "Contenido entretenido",
          "Cuidado bucal infantil",
          "Promociones",
          "Comparaciones entre productos",
          "No me interesa seguir contenido de estas marcas"
        ],
        exclusiveOptions: ["No me interesa seguir contenido de estas marcas"]
      },
      {
        id: "channels",
        type: "checkboxMax3",
        label: "¿Dónde tendría más sentido encontrar contenido o información de una marca de cuidado bucal?",
        required: true,
        help: "Elegí hasta 3.",
        max: 3,
        shuffle: true,
        options: [
          "Instagram",
          "TikTok",
          "Facebook",
          "YouTube",
          "Google / buscadores",
          "Web de la marca",
          "Farmacias",
          "Supermercados",
          "Consultorio odontológico",
          "Otro"
        ],
        otherLabel: "Otro",
        otherPlaceholder: "¿Dónde?"
      },
      {
        id: "one_change",
        type: "textarea",
        label: "Si PRODENT pudiera cambiar o mejorar una sola cosa para convertirse en una marca que elegirías todos los días, ¿qué debería ser?",
        required: false,
        placeholder: "Podés responder en una frase."
      }
    ]
  }
];

function knowsProdent() {
  return [
    "Sí, la conozco bien",
    "Sí, me suena / conozco algo",
    "Creo haberla escuchado"
  ].includes(state.answers.prodent_awareness);
}

function visibleSections() {
  return sections.filter(section => !section.condition || section.condition());
}

function buildFlow() {
  const flow = [];

  visibleSections().forEach(section => {
    section.fields.forEach((field, fieldIndex) => {
      flow.push({
        key: `${section.id}:${field.id}`,
        section,
        field,
        showStimulus: Boolean(section.stimulus && fieldIndex === 0)
      });
    });
  });

  return flow;
}

function findCurrentIndex() {
  const flow = buildFlow();

  if (!flow.length) return 0;

  if (!state.currentKey) {
    state.currentKey = flow[0].key;
    return 0;
  }

  const index = flow.findIndex(item => item.key === state.currentKey);
  return index >= 0 ? index : 0;
}

function currentItem() {
  const flow = buildFlow();
  return flow[findCurrentIndex()];
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shuffleArray(values) {
  const array = [...values];

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function optionsFor(field) {
  if (!field.shuffle) return field.options;

  if (!state.randomized[field.id]) {
    const fixedLast = field.options.filter(option =>
      option === "Otro" ||
      option === "No me interesa seguir contenido de estas marcas"
    );

    const shuffleable = field.options.filter(option =>
      !fixedLast.includes(option)
    );

    state.randomized[field.id] = [
      ...shuffleArray(shuffleable),
      ...fixedLast
    ];
  }

  return state.randomized[field.id];
}

function saveDraft(showFeedback = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (showFeedback) {
    const status = document.getElementById("saveStatus");

    if (status) {
      status.classList.add("is-saved");
      status.innerHTML = `<span class="save-dot"></span>Guardado`;

      clearTimeout(saveDraft._timer);

      saveDraft._timer = setTimeout(() => {
        if (status) {
          status.classList.remove("is-saved");
          status.innerHTML = `<span class="save-dot"></span>Guardado automático`;
        }
      }, 1200);
    }
  }
}

function restoreDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return;

  try {
    const saved = JSON.parse(raw);

    if (saved?.answers) {
      state.started = Boolean(saved.started);
      state.currentKey = saved.currentKey || null;
      state.responseId = saved.responseId || state.responseId;
      state.startedAt = saved.startedAt || state.startedAt;
      state.answers = saved.answers || {};
      state.randomized = saved.randomized || {};
    }
  } catch (error) {
    console.warn("No se pudo recuperar el borrador.", error);
  }
}

function render() {
  document.body.classList.toggle("is-surveying", state.started);

  document.getElementById("compactProgress").hidden = !state.started;

  if (!state.started) {
    renderIntro();
    return;
  }

  renderQuestion();
}

function renderIntro() {
  document.getElementById("survey").innerHTML = `
    <section class="intro-screen">
      <p class="intro-kicker">INVESTIGACIÓN EXPLORATORIA</p>

      <h1 class="intro-title">
        ¿Cómo elegimos lo que usamos todos los días?
      </h1>

      <p class="intro-copy">
        Queremos entender hábitos, percepciones y criterios de elección
        relacionados con el cuidado bucal. No hay respuestas correctas:
        nos interesa tu experiencia real.
      </p>

      <div class="intro-facts">
        <span class="fact-pill">Anónima</span>
        <span class="fact-pill">6–8 minutos</span>
        <span class="fact-pill">Guardado automático</span>
      </div>

      <div class="intro-actions">
        <button id="startBtn" class="btn btn-primary">
          Comenzar →
        </button>
      </div>

      <p class="consent-note">
        Al comenzar, aceptás participar voluntariamente de esta investigación.
        No solicitamos nombre, correo ni datos de contacto.
      </p>
    </section>
  `;

  document.getElementById("startBtn").addEventListener("click", () => {
    state.started = true;
    state.answers.consent = "Sí, continuar";

    const flow = buildFlow();
    state.currentKey = flow[0]?.key || null;

    saveDraft(true);
    render();
  });
}

function renderQuestion() {
  const flow = buildFlow();
  const index = findCurrentIndex();
  const item = flow[index];
  const { section, field } = item;

  const progress = Math.round(((index + 1) / flow.length) * 100);

  document.getElementById("sectionProgress").textContent =
    `Sección ${section.number} de 9 · ${section.title}`;

  document.getElementById("questionProgress").textContent =
    `Pregunta ${index + 1} de ${flow.length}`;

  document.getElementById("progressBar").style.width =
    `${progress}%`;

  const optional = field.required
    ? ""
    : `<span class="optional-note">Opcional</span>`;

  const stimulus = item.showStimulus
    ? `
      <div class="stimulus">
        <strong>Contexto</strong><br>
        ${escapeHtml(section.stimulus)}
      </div>
    `
    : "";

  document.getElementById("survey").innerHTML = `
    <section class="question-screen" data-field="${escapeHtml(field.id)}">
      <p class="section-label">
        ${escapeHtml(section.title)}
      </p>

      <div class="question-title-row">
        <h1 class="question-title">
          ${escapeHtml(field.label)}
        </h1>

        ${optional}
      </div>

      ${
        field.help
          ? `<p class="question-help">${escapeHtml(field.help)}</p>`
          : ""
      }

      ${stimulus}

      <div class="answer-area">
        ${answerHtml(field)}
      </div>

      <div id="inlineError" class="inline-error"></div>

      <div class="question-spacer"></div>

      <div class="actions">
        ${
          index > 0
            ? `<button id="backBtn" class="btn btn-secondary">← Anterior</button>`
            : `<span></span>`
        }

        <span class="keyboard-hint">Enter para continuar</span>

        <button id="nextBtn" class="btn btn-primary">
          ${index === flow.length - 1 ? "Enviar respuestas" : "Continuar →"}
        </button>
      </div>
    </section>
  `;

  hydrateField(field);
  wireFieldEvents(field);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function answerHtml(field) {
  const placeholder = field.placeholder
    ? ` placeholder="${escapeHtml(field.placeholder)}"`
    : "";

  if (field.type === "text") {
    return `
      <input
        type="text"
        data-id="${field.id}"
        ${placeholder}
        autocomplete="off"
      >
    `;
  }

  if (field.type === "textarea") {
    return `
      <textarea
        data-id="${field.id}"
        ${placeholder}
      ></textarea>
    `;
  }

  if (field.type === "select") {
    return `
      <select data-id="${field.id}">
        ${field.options.map(option => `
          <option value="${option === "Seleccionar…" ? "" : escapeHtml(option)}">
            ${escapeHtml(option)}
          </option>
        `).join("")}
      </select>

      ${otherInputHtml(field)}
    `;
  }

  if (
    field.type === "radio" ||
    field.type === "checkbox" ||
    field.type.startsWith("checkboxMax")
  ) {
    const inputType = field.type === "radio" ? "radio" : "checkbox";
    const max = field.max || (
      field.type === "checkboxMax3" ? 3 :
      field.type === "checkboxMax2" ? 2 :
      null
    );

    return `
      ${
        max
          ? `<div id="selectionMeta" class="selection-meta">0/${max} seleccionadas</div>`
          : ""
      }

      <div class="option-grid">
        ${optionsFor(field).map(option => `
          <label class="option">
            <input
              type="${inputType}"
              name="${field.id}"
              data-id="${field.id}"
              value="${escapeHtml(option)}"
            >
            <span>${escapeHtml(option)}</span>
          </label>
        `).join("")}
      </div>

      ${otherInputHtml(field)}
    `;
  }

  if (field.type === "matrix5" || field.type === "matrix5single") {
    const rows =
      field.type === "matrix5single"
        ? ["Respuesta"]
        : field.rows;

    return `
      <div class="likert-list ${field.type === "matrix5single" ? "single-likert" : ""}">
        ${rows.map((row, rowIndex) => `
          <div
            class="likert-row"
            data-matrix-row="${escapeHtml(row)}"
          >
            ${
              field.type === "matrix5"
                ? `<div class="likert-label">${escapeHtml(row)}</div>`
                : ""
            }

            <div class="likert-scale">
              ${[1, 2, 3, 4, 5].map(value => `
                <label>
                  <input
                    type="radio"
                    name="${field.id}_${rowIndex}"
                    data-matrix="${field.id}"
                    data-row="${escapeHtml(row)}"
                    value="${value}"
                  >
                  <span>${value}</span>
                </label>
              `).join("")}
            </div>

            <div class="likert-anchors">
              <span>${escapeHtml(field.left)}</span>
              <span>${escapeHtml(field.right)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  if (field.type === "scale10") {
    return `
      <div class="scale-10">
        ${Array.from({ length: 11 }, (_, value) => `
          <label>
            <input
              type="radio"
              name="${field.id}"
              data-id="${field.id}"
              value="${value}"
            >
            <span>${value}</span>
          </label>
        `).join("")}
      </div>

      <div class="scale-anchors">
        <span>${escapeHtml(field.left)}</span>
        <span>${escapeHtml(field.right)}</span>
      </div>
    `;
  }

  return "";
}

function otherInputHtml(field) {
  if (!field.otherLabel) return "";

  return `
    <div id="${field.id}_other_wrap" class="other-wrap" hidden>
      <input
        class="other-input"
        type="text"
        data-other-for="${field.id}"
        placeholder="${escapeHtml(field.otherPlaceholder || "Especificá")}"
      >
    </div>
  `;
}

function hydrateField(field) {
  const stored = state.answers[field.id];

  if (
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "select"
  ) {
    const element = document.querySelector(`[data-id="${field.id}"]`);

    if (element && stored != null) {
      element.value = stored;
    }
  }

  else if (field.type === "radio" || field.type === "scale10") {
    document
      .querySelectorAll(`[data-id="${field.id}"]`)
      .forEach(element => {
        element.checked = element.value === String(stored ?? "");
      });
  }

  else if (
    field.type === "checkbox" ||
    field.type.startsWith("checkboxMax")
  ) {
    const values = stored || [];

    document
      .querySelectorAll(`[data-id="${field.id}"]`)
      .forEach(element => {
        element.checked = values.includes(element.value);
      });

    updateSelectionLimit(field);
  }

  else if (field.type === "matrix5" || field.type === "matrix5single") {
    Object.entries(stored || {}).forEach(([row, value]) => {
      document
        .querySelectorAll(`[data-matrix="${field.id}"]`)
        .forEach(element => {
          if (
            element.dataset.row === row &&
            element.value === String(value)
          ) {
            element.checked = true;
          }
        });
    });
  }

  const other = state.answers[`${field.id}_other`];

  if (field.otherLabel) {
    const otherInput = document.querySelector(
      `[data-other-for="${field.id}"]`
    );

    if (otherInput && other != null) {
      otherInput.value = other;
    }

    updateOtherVisibility(field);
  }
}

function wireFieldEvents(field) {
  document
    .querySelectorAll("input, textarea, select")
    .forEach(element => {
      element.addEventListener("change", () => {
        if (
          field.type === "checkbox" ||
          field.type.startsWith("checkboxMax")
        ) {
          applyExclusiveRules(field, element);
          updateSelectionLimit(field);
        }

        updateOtherVisibility(field);
        captureField(field, false);
        saveDraft(true);
        clearError();
      });

      element.addEventListener("input", () => {
        captureField(field, false);
        saveDraft(false);
        clearError();
      });
    });

  document.getElementById("backBtn")?.addEventListener("click", goBack);

  document.getElementById("nextBtn")?.addEventListener("click", goNext);

  document.addEventListener("keydown", handleEnter, { once: true });
}

function handleEnter(event) {
  if (event.key !== "Enter") {
    document.addEventListener("keydown", handleEnter, { once: true });
    return;
  }

  const target = event.target;

  if (target?.tagName === "TEXTAREA") {
    document.addEventListener("keydown", handleEnter, { once: true });
    return;
  }

  event.preventDefault();
  goNext();
}

function applyExclusiveRules(field, changedElement) {
  if (!field.exclusiveOptions?.length) return;

  const controls = [
    ...document.querySelectorAll(`[data-id="${field.id}"]`)
  ];

  const exclusiveSelected =
    field.exclusiveOptions.includes(changedElement.value) &&
    changedElement.checked;

  if (exclusiveSelected) {
    controls.forEach(control => {
      if (control !== changedElement) {
        control.checked = false;
      }
    });

    return;
  }

  if (changedElement.checked) {
    controls.forEach(control => {
      if (field.exclusiveOptions.includes(control.value)) {
        control.checked = false;
      }
    });
  }
}

function updateSelectionLimit(field) {
  const max = field.max || (
    field.type === "checkboxMax3" ? 3 :
    field.type === "checkboxMax2" ? 2 :
    null
  );

  if (!max) return;

  const controls = [
    ...document.querySelectorAll(`[data-id="${field.id}"]`)
  ];

  const selected = controls.filter(control => control.checked);

  const meta = document.getElementById("selectionMeta");

  if (meta) {
    meta.textContent = `${selected.length}/${max} seleccionadas`;
  }

  controls.forEach(control => {
    control.disabled =
      selected.length >= max &&
      !control.checked;
  });
}

function isOtherSelected(field) {
  const target = field.otherLabel;

  if (!target) return false;

  if (field.type === "select") {
    return document.querySelector(`[data-id="${field.id}"]`)?.value === target;
  }

  return [
    ...document.querySelectorAll(`[data-id="${field.id}"]:checked`)
  ].some(element => element.value === target);
}

function updateOtherVisibility(field) {
  if (!field.otherLabel) return;

  const wrap = document.getElementById(`${field.id}_other_wrap`);

  if (wrap) {
    wrap.hidden = !isOtherSelected(field);
  }
}

function captureField(field, validate = true) {
  clearMatrixMissing();

  let value;
  let valid = true;
  let errorMessage = "Respondé esta pregunta para continuar.";

  if (
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "select"
  ) {
    const element = document.querySelector(`[data-id="${field.id}"]`);
    value = (element?.value || "").trim();

    if (validate && field.required && !value) {
      valid = false;
    }
  }

  else if (field.type === "radio" || field.type === "scale10") {
    const element = document.querySelector(
      `[data-id="${field.id}"]:checked`
    );

    value = element ? element.value : "";

    if (validate && field.required && value === "") {
      valid = false;
    }
  }

  else if (
    field.type === "checkbox" ||
    field.type.startsWith("checkboxMax")
  ) {
    value = [
      ...document.querySelectorAll(
        `[data-id="${field.id}"]:checked`
      )
    ].map(element => element.value);

    if (validate && field.required && value.length === 0) {
      valid = false;
    }

    const max = field.max || (
      field.type === "checkboxMax3" ? 3 :
      field.type === "checkboxMax2" ? 2 :
      null
    );

    if (validate && max && value.length > max) {
      valid = false;
      errorMessage = `Elegí como máximo ${max} opciones.`;
    }
  }

  else if (field.type === "matrix5" || field.type === "matrix5single") {
    value = {};

    const rows =
      field.type === "matrix5single"
        ? ["Respuesta"]
        : field.rows;

    const missingRows = [];

    rows.forEach(row => {
      const checked = [
        ...document.querySelectorAll(
          `[data-matrix="${field.id}"]`
        )
      ].find(
        element =>
          element.dataset.row === row &&
          element.checked
      );

      if (checked) {
        value[row] = Number(checked.value);
      } else if (validate && field.required) {
        missingRows.push(row);
      }
    });

    if (missingRows.length) {
      valid = false;
      errorMessage =
        missingRows.length === 1
          ? "Falta responder un ítem."
          : `Faltan ${missingRows.length} ítems por responder.`;

      missingRows.forEach(row => {
        const rowElement = document.querySelector(
          `[data-matrix-row="${CSS.escape(row)}"]`
        );

        rowElement?.classList.add("is-missing");
      });
    }
  }

  state.answers[field.id] = value;

  if (field.otherLabel) {
    const otherInput = document.querySelector(
      `[data-other-for="${field.id}"]`
    );

    const otherValue = (otherInput?.value || "").trim();

    state.answers[`${field.id}_other`] = otherValue;

    if (
      validate &&
      isOtherSelected(field) &&
      !otherValue
    ) {
      valid = false;
      errorMessage = "Especificá la opción “Otro” para continuar.";
    }
  }

  return {
    valid,
    errorMessage
  };
}

function clearMatrixMissing() {
  document
    .querySelectorAll(".likert-row.is-missing")
    .forEach(element => {
      element.classList.remove("is-missing");
    });
}

function showError(message) {
  const error = document.getElementById("inlineError");

  if (!error) return;

  error.textContent = message;
  error.classList.add("is-visible");

  error.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function clearError() {
  const error = document.getElementById("inlineError");

  if (error) {
    error.classList.remove("is-visible");
    error.textContent = "";
  }

  clearMatrixMissing();
}

function goBack() {
  const flow = buildFlow();
  const index = findCurrentIndex();

  if (index <= 0) return;

  captureField(flow[index].field, false);

  state.currentKey = flow[index - 1].key;
  saveDraft(false);
  render();
}

async function goNext() {
  const flowBefore = buildFlow();
  const indexBefore = findCurrentIndex();
  const item = flowBefore[indexBefore];

  const result = captureField(item.field, true);

  if (!result.valid) {
    showError(result.errorMessage);
    return;
  }

  // Si se cambia awareness a "no conoce", limpia percepción actual.
  if (
    item.field.id === "prodent_awareness" &&
    !knowsProdent()
  ) {
    [
      "prodent_first_association",
      "prodent_products_recall",
      "prodent_associations",
      "prodent_three_words",
      "consideration_pre",
      "consideration_pre_reason"
    ].forEach(key => {
      delete state.answers[key];
      delete state.answers[`${key}_other`];
    });
  }

  saveDraft(true);

  const flowAfter = buildFlow();
  const currentIndexAfter = flowAfter.findIndex(
    flowItem => flowItem.key === item.key
  );

  if (currentIndexAfter < flowAfter.length - 1) {
    state.currentKey = flowAfter[currentIndexAfter + 1].key;
    saveDraft(false);
    render();
  } else {
    await submitSurvey();
  }
}

function deriveIndexes(a) {
  const perception = a.prodent_associations || {};
  const drivers = a.driver_importance || {};

  const value = (object, key) =>
    Number(object?.[key] || 0);

  const average = (...numbers) => {
    const valid = numbers.filter(
      n => Number.isFinite(n) && n > 0
    );

    if (!valid.length) return "";

    return +(
      valid.reduce((sum, n) => sum + n, 0) /
      valid.length
    ).toFixed(2);
  };

  const considerationPre =
    a.consideration_pre !== undefined &&
    a.consideration_pre !== ""
      ? Number(a.consideration_pre)
      : null;

  const considerationPost =
    a.consideration_post !== undefined &&
    a.consideration_post !== ""
      ? Number(a.consideration_post)
      : null;

  return {
    awareness_score:
      a.prodent_awareness === "Sí, la conozco bien"
        ? 4
        : a.prodent_awareness === "Sí, me suena / conozco algo"
        ? 3
        : a.prodent_awareness === "Creo haberla escuchado"
        ? 2
        : a.prodent_awareness === "No estoy seguro/a"
        ? 1
        : 0,

    trust_index: average(
      value(perception, "Confianza"),
      value(perception, "Calidad"),
      value(perception, "Respaldo profesional")
    ),

    medicinal_index: average(
      value(perception, "Medicamentos"),
      value(perception, "Odontología profesional"),
      value(perception, "Tratamiento de problemas bucales")
    ),

    daily_care_index: average(
      value(perception, "Cuidado bucal cotidiano"),
      value(perception, "Prevención"),
      value(perception, "Productos para toda la familia")
    ),

    innovation_index: average(
      value(perception, "Innovación"),
      value(perception, "Modernidad")
    ),

    care_effect:
      considerationPre !== null &&
      considerationPost !== null
        ? considerationPost - considerationPre
        : "",

    effectiveness_importance:
      value(drivers, "Efectividad"),

    trust_importance:
      value(drivers, "Confianza en la marca"),

    innovation_importance:
      value(drivers, "Innovación"),

    dentist_importance:
      value(drivers, "Recomendación del odontólogo")
  };
}

function wait_(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jsonpRequest_(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const callbackName =
      `__nlab_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const separator =
      url.includes("?")
        ? "&"
        : "?";

    const script =
      document.createElement("script");

    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;

      clearTimeout(timer);

      try {
        delete window[callbackName];
      } catch (_) {
        window[callbackName] = undefined;
      }

      script.remove();
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Tiempo de espera agotado al verificar el guardado."
        )
      );
    }, timeoutMs);

    window[callbackName] = data => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(
        new Error(
          "No se pudo verificar el guardado."
        )
      );
    };

    script.src =
      `${url}${separator}callback=${encodeURIComponent(callbackName)}`;

    document.head.appendChild(script);
  });
}

async function verifySavedResponse_(responseId) {
  const statusUrl =
    `${SCRIPT_URL}?action=status&response_id=${encodeURIComponent(responseId)}`;

  const result =
    await jsonpRequest_(
      statusUrl,
      3500
    );

  if (
    result &&
    result.ok === true &&
    result.found === true
  ) {
    return true;
  }

  if (
    result &&
    result.ok === false
  ) {
    throw new Error(
      result.error ||
      "Google Sheets devolvió un error."
    );
  }

  return false;
}

async function submitSurvey() {
  const button =
    document.getElementById(
      "nextBtn"
    );

  if (button) {
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.innerHTML = `
      <span class="submit-spinner" aria-hidden="true"></span>
      <span>Guardando respuesta…</span>
    `;
  }

  const payload = {
    response_id:
      state.responseId,

    started_at:
      state.startedAt,

    submitted_at:
      new Date()
        .toISOString(),

    consent:
      "Sí, continuar",

    ...state.answers,

    derived:
      deriveIndexes(
        state.answers
      )
  };

  const body =
    new URLSearchParams();

  body.set(
    "payload",
    JSON.stringify(
      payload
    )
  );

  // Iniciamos el envío y NO bloqueamos al usuario esperando
  // la verificación. `keepalive` ayuda a terminar el POST
  // aunque la persona cierre la pestaña después.
  const sendPromise =
    fetch(
      SCRIPT_URL,
      {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body:
          body.toString()
      }
    );

  // Dejamos el spinner visible apenas un instante para
  // dar feedback inmediato y luego pasamos a la pantalla final.
  await wait_(650);

  showSuccess("pending");

  // La confirmación sigue en segundo plano.
  void confirmSubmissionInBackground_(
    sendPromise,
    state.responseId
  );
}

async function confirmSubmissionInBackground_(
  sendPromise,
  responseId
) {
  try {
    await sendPromise;

    const confirmed =
      await verifySavedResponse_(
        responseId
      );

    if (confirmed) {
      localStorage.removeItem(
        STORAGE_KEY
      );

      updateFinalSaveStatus_(
        "confirmed"
      );

      return;
    }

    throw new Error(
      "La respuesta todavía no pudo confirmarse."
    );
  }

  catch (error) {
    console.warn(
      "Confirmación en segundo plano:",
      error
    );

    // Segundo intento silencioso. No bloquea la experiencia.
    await wait_(1800);

    try {
      const confirmed =
        await verifySavedResponse_(
          responseId
        );

      if (confirmed) {
        localStorage.removeItem(
          STORAGE_KEY
        );

        updateFinalSaveStatus_(
          "confirmed"
        );

        return;
      }
    }

    catch (retryError) {
      console.warn(
        "Segundo intento de confirmación:",
        retryError
      );
    }

    // Conservamos el borrador local. Si el POST sí llegó,
    // el backend detecta duplicados por response_id.
    updateFinalSaveStatus_(
      "unconfirmed"
    );
  }
}

function updateFinalSaveStatus_(status) {
  const statusBox =
    document.getElementById(
      "finalSaveStatus"
    );

  if (!statusBox) return;

  if (status === "confirmed") {
    statusBox.className =
      "final-save-status is-confirmed";

    statusBox.innerHTML = `
      <span class="final-status-icon" aria-hidden="true">✓</span>
      <span>Respuesta registrada correctamente.</span>
    `;

    return;
  }

  if (status === "unconfirmed") {
    statusBox.className =
      "final-save-status is-unconfirmed";

    statusBox.innerHTML = `
      <span class="final-status-icon" aria-hidden="true">!</span>
      <span>
        El envío sigue procesándose. Tus respuestas permanecen
        guardadas en este dispositivo por seguridad.
      </span>
    `;
  }
}

function showSuccess(saveState = "pending") {
  document.body.classList.add("is-surveying");

  document.getElementById("sectionProgress").textContent =
    "Completado";

  document.getElementById("questionProgress").textContent =
    "100%";

  document.getElementById("progressBar").style.width =
    "100%";

  const saveStatusHtml =
    saveState === "confirmed"
      ? `
        <div
          id="finalSaveStatus"
          class="final-save-status is-confirmed"
          role="status"
          aria-live="polite"
        >
          <span class="final-status-icon" aria-hidden="true">✓</span>
          <span>Respuesta registrada correctamente.</span>
        </div>
      `
      : `
        <div
          id="finalSaveStatus"
          class="final-save-status is-pending"
          role="status"
          aria-live="polite"
        >
          <span class="final-mini-spinner" aria-hidden="true"></span>
          <span>Terminando de registrar tu respuesta…</span>
        </div>
      `;

  document.getElementById("survey").innerHTML = `
    <section class="success-screen">
      <div class="success-icon">✓</div>

      <h2>
        Gracias por sumar tu mirada.
      </h2>

      <p>
        Ya podés cerrar esta página. Estamos terminando de registrar
        tu respuesta de forma anónima en segundo plano.
      </p>

      ${saveStatusHtml}
    </section>
  `;

  document.getElementById("appFooter").textContent =
    "nLab · Laboratorio de Innovación de Lupe";
}

restoreDraft();
render();
