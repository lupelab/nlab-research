const SPREADSHEET_ID =
  "1d6NduKdibnZD5YtWgXEdzU95dauJ5ot9rf0fQf8I4Ms";

const SHEET_NAME =
  "Respuestas";

const STATUS_PREFIX =
  "nlab_saved_";

function doGet(e) {
  const action =
    e && e.parameter
      ? e.parameter.action || ""
      : "";

  const callback =
    e && e.parameter
      ? e.parameter.callback || ""
      : "";

  let result;

  try {
    if (action === "status") {
      const responseId =
        e.parameter.response_id || "";

      if (!responseId) {
        throw new Error(
          "response_id requerido"
        );
      }

      // Ruta rápida: doPost registra el response_id en Script Properties.
      // Así evitamos abrir y recorrer Google Sheets en cada verificación.
      const savedMarker =
        PropertiesService
          .getScriptProperties()
          .getProperty(
            STATUS_PREFIX + responseId
          );

      if (savedMarker) {
        result = {
          ok: true,
          found: true,
          response_id: responseId
        };
      } else {
        // Fallback para respuestas antiguas o migradas.
        const ss =
          SpreadsheetApp.openById(
            SPREADSHEET_ID
          );

        const sheet =
          ss.getSheetByName(
            SHEET_NAME
          );

        const found =
          sheet
            ? hasResponseId_(
                sheet,
                responseId
              )
            : false;

        if (found) {
          PropertiesService
            .getScriptProperties()
            .setProperty(
              STATUS_PREFIX + responseId,
              String(Date.now())
            );
        }

        result = {
          ok: true,
          found: found,
          response_id: responseId
        };
      }
    }

    else {
      result = {
        ok: true,
        service:
          "prodent-research",
        spreadsheet_id:
          SPREADSHEET_ID,
        sheet:
          SHEET_NAME
      };
    }
  }

  catch (error) {
    result = {
      ok: false,
      error: String(error)
    };
  }

  return respond_(
    result,
    callback
  );
}

function doPost(e) {
  const lock =
    LockService.getScriptLock();

  lock.waitLock(10000);

  try {
    const payload =
      JSON.parse(
        e.parameter.payload || "{}"
      );

    if (!payload.response_id) {
      throw new Error(
        "response_id requerido"
      );
    }

    const ss =
      SpreadsheetApp.openById(
        SPREADSHEET_ID
      );

    let sheet =
      ss.getSheetByName(
        SHEET_NAME
      );

    if (!sheet) {
      sheet =
        ss.insertSheet(
          SHEET_NAME
        );
    }

    // Evita duplicados si el navegador reintenta
    // después de un problema de verificación.
    if (
      sheet.getLastRow() > 0 &&
      hasResponseId_(
        sheet,
        payload.response_id
      )
    ) {
      PropertiesService
        .getScriptProperties()
        .setProperty(
          STATUS_PREFIX + payload.response_id,
          String(Date.now())
        );

      return respond_({
        ok: true,
        duplicate: true,
        response_id:
          payload.response_id
      });
    }

    const flattened =
      flattenObject_(
        payload
      );

    let headers =
      getHeaders_(
        sheet
      );

    // Si la hoja está completamente vacía,
    // crea los encabezados con todos los campos
    // recibidos en el primer envío.
    if (!headers.length) {
      headers =
        Object.keys(
          flattened
        );

      sheet
        .getRange(
          1,
          1,
          1,
          headers.length
        )
        .setValues(
          [headers]
        );

      formatHeader_(
        sheet,
        headers.length
      );
    }

    const missing =
      Object.keys(
        flattened
      ).filter(
        key =>
          !headers.includes(
            key
          )
      );

    if (missing.length) {
      const start =
        headers.length + 1;

      sheet
        .getRange(
          1,
          start,
          1,
          missing.length
        )
        .setValues(
          [missing]
        );

      missing.forEach(
        header =>
          headers.push(
            header
          )
      );
    }

    const row =
      headers.map(
        header =>
          normalizeCell_(
            flattened[
              header
            ]
          )
      );

    sheet.appendRow(
      row
    );

    SpreadsheetApp.flush();

    // Marca persistente para que la verificación posterior sea casi inmediata.
    PropertiesService
      .getScriptProperties()
      .setProperty(
        STATUS_PREFIX + payload.response_id,
        String(Date.now())
      );

    return respond_({
      ok: true,
      saved: true,
      response_id:
        payload.response_id
    });

  }

  catch (error) {
    return respond_({
      ok: false,
      error:
        String(error)
    });

  }

  finally {
    lock.releaseLock();
  }
}

function setupSheet() {
  const ss =
    SpreadsheetApp.openById(
      SPREADSHEET_ID
    );

  let sheet =
    ss.getSheetByName(
      SHEET_NAME
    );

  if (!sheet) {
    sheet =
      ss.insertSheet(
        SHEET_NAME
      );
  }

  if (
    sheet.getLastRow() === 0
  ) {
    const headers = [
      "response_id",
      "started_at",
      "submitted_at",

      "consent",
      "age",
      "household",
      "purchase_role",

      "oral_care_first_thought",
      "products_used",
      "products_used_other",
      "purchase_frequency",
      "purchase_places",
      "purchase_places_other",

      "brand_recall",
      "top_of_mind",
      "current_toothpaste_brand",
      "current_toothpaste_brand_other",

      "driver_importance.Efectividad",
      "driver_importance.Precio",
      "driver_importance.Confianza en la marca",
      "driver_importance.Recomendación del odontólogo",
      "driver_importance.Ingredientes",
      "driver_importance.Innovación",
      "driver_importance.Sabor / sensación",
      "driver_importance.Disponibilidad",
      "driver_importance.Fabricación / origen",
      "driver_importance.Diseño / presentación",
      "driver_importance.Beneficios específicos",

      "choice_weight",
      "choice_weight_other",

      "prodent_awareness",
      "prodent_first_association",
      "prodent_products_recall",

      "prodent_associations.Medicamentos",
      "prodent_associations.Odontología profesional",
      "prodent_associations.Tratamiento de problemas bucales",
      "prodent_associations.Cuidado bucal cotidiano",
      "prodent_associations.Prevención",
      "prodent_associations.Confianza",
      "prodent_associations.Calidad",
      "prodent_associations.Innovación",
      "prodent_associations.Modernidad",
      "prodent_associations.Accesibilidad",
      "prodent_associations.Productos para toda la familia",
      "prodent_associations.Respaldo profesional",

      "prodent_three_words",
      "consideration_pre",
      "consideration_pre_reason",

      "dentist_influence.Resolver un problema específico",
      "dentist_influence.Elegir una pasta de uso diario",
      "dentist_influence.Elegir un cepillo",
      "dentist_influence.Productos infantiles",
      "dentist_influence.Productos preventivos",
      "dentist_influence.Productos con ingredientes que no conozco",

      "innovation_trust",

      "value_propositions.Ingredientes o tecnologías innovadoras",
      "value_propositions.Ingredientes naturales",
      "value_propositions.Protección completa para todos los días",
      "value_propositions.Respaldo profesional",
      "value_propositions.Productos sustentables",
      "value_propositions.Buena relación precio-calidad",
      "value_propositions.Desarrollo / fabricación en Paraguay",

      "care_credibility.Respuesta",
      "consideration_post",
      "needed_to_prove",
      "future_attributes",
      "content_interest",
      "channels",
      "channels_other",
      "one_change",

      "derived.awareness_score",
      "derived.trust_index",
      "derived.medicinal_index",
      "derived.daily_care_index",
      "derived.innovation_index",
      "derived.care_effect",
      "derived.effectiveness_importance",
      "derived.trust_importance",
      "derived.innovation_importance",
      "derived.dentist_importance"
    ];

    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setValues(
        [headers]
      );

    formatHeader_(
      sheet,
      headers.length
    );
  }

  SpreadsheetApp.flush();

  return {
    ok: true,
    spreadsheet:
      ss.getName(),
    sheet:
      sheet.getName()
  };
}

function hasResponseId_(
  sheet,
  responseId
) {
  if (
    !sheet ||
    !responseId ||
    sheet.getLastRow() < 2
  ) {
    return false;
  }

  const headers =
    getHeaders_(
      sheet
    );

  const responseIdIndex =
    headers.indexOf(
      "response_id"
    );

  if (
    responseIdIndex === -1
  ) {
    return false;
  }

  const values =
    sheet
      .getRange(
        2,
        responseIdIndex + 1,
        sheet.getLastRow() - 1,
        1
      )
      .getDisplayValues()
      .flat();

  return values.includes(
    String(responseId)
  );
}

function respond_(
  data,
  callback = ""
) {
  const safeCallback =
    /^[A-Za-z_$][0-9A-Za-z_$]*$/
      .test(callback)
      ? callback
      : "";

  if (safeCallback) {
    return ContentService
      .createTextOutput(
        `${safeCallback}(${JSON.stringify(data)});`
      )
      .setMimeType(
        ContentService.MimeType.JAVASCRIPT
      );
  }

  return ContentService
    .createTextOutput(
      JSON.stringify(
        data
      )
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

function formatHeader_(
  sheet,
  count
) {
  sheet.setFrozenRows(1);

  const range =
    sheet.getRange(
      1,
      1,
      1,
      count
    );

  range.setFontWeight(
    "bold"
  );

  range.setBackground(
    "#000000"
  );

  range.setFontColor(
    "#ffffff"
  );
}

function getHeaders_(
  sheet
) {
  const lastCol =
    sheet.getLastColumn();

  if (!lastCol) {
    return [];
  }

  return sheet
    .getRange(
      1,
      1,
      1,
      lastCol
    )
    .getValues()[0]
    .map(String);
}

function flattenObject_(
  obj,
  prefix = "",
  output = {}
) {
  Object.entries(
    obj || {}
  ).forEach(
    ([key, value]) => {
      const path =
        prefix
          ? `${prefix}.${key}`
          : key;

      if (
        Array.isArray(
          value
        )
      ) {
        output[path] =
          value.join(
            " | "
          );
      }

      else if (
        value &&
        typeof value ===
          "object"
      ) {
        flattenObject_(
          value,
          path,
          output
        );
      }

      else {
        output[path] =
          value;
      }
    }
  );

  return output;
}

function normalizeCell_(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (
    typeof value ===
      "boolean"
  ) {
    return value
      ? "Sí"
      : "No";
  }

  return value;
}
