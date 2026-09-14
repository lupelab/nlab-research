# nLab — Research PRODENT UX v2

Versión rediseñada para una experiencia de respuesta más fluida y mobile-first.

## Mejoras UX
- Portada limpia con CTA “Comenzar”.
- Una pregunta por pantalla.
- Header compacto durante la encuesta.
- Progreso por sección y por pregunta.
- Matrices convertidas en tarjetas verticales 1–5, sin scroll horizontal.
- Errores inline.
- Contador y bloqueo al alcanzar máximos de selección.
- Opciones exclusivas (“Ninguno”, “No me interesa…”).
- Campo “Otro” dinámico y guardado en columnas adicionales.
- Autosave local en cada interacción.
- Randomización estable de alternativas cuando el orden no importa.
- Branching: quien no conoce PRODENT omite percepción actual.
- Pantalla final mejorada.
- Diseño responsive y sticky navigation en mobile.

## Backend
`app.js` mantiene la URL actual de Google Apps Script.

`google-apps-script/Code.gs` se mantiene compatible. Como el backend agrega columnas nuevas automáticamente, campos como:
- products_used_other
- purchase_places_other
- current_toothpaste_brand_other
- choice_weight_other
- channels_other

se crearán solos al llegar respuestas.

## Probar localmente
Desde la carpeta del proyecto:

```powershell
python -m http.server 5500
```

Abrir:
`http://localhost:5500`

Si había una versión anterior abierta, usar `Ctrl + F5`.


## Identidad nLab

El isotipo/wordmark usa:
- una `u` rotada 180° para funcionar visualmente como una `n`;
- una `e` rotada 180° para funcionar visualmente como una `a`;
- `L` y `b` normales.

La lectura conceptual es `nLab` / “ene lab”.


## Google Sheets — configuración corregida

Spreadsheet ID configurado:
`1d6NduKdibnZD5YtWgXEdzU95dauJ5ot9rf0fQf8I4Ms`

Pestaña:
`Respuestas`

La versión incluye verificación real de guardado:
1. el formulario hace POST al Apps Script;
2. Apps Script guarda la fila;
3. el navegador consulta el `response_id`;
4. solo muestra la pantalla de éxito si confirma que la fila existe.

### Pasos obligatorios en Apps Script
1. Abrir el proyecto de Google Apps Script usado por la encuesta.
2. Reemplazar TODO `Code.gs` por el incluido en `google-apps-script/Code.gs`.
3. Guardar.
4. Ejecutar `setupSheet()` una vez y aceptar permisos.
5. Ir a **Implementar → Administrar implementaciones**.
6. Editar la implementación Web App existente y crear una **nueva versión**.
7. Ejecutar como: **Yo**.
8. Acceso: **Cualquier persona**.
9. Confirmar que la URL `/exec` siga siendo:
   `https://script.google.com/macros/s/AKfycbw5WfmCYFJR0rQEDvtrrD_ZUhQJKrcPNRJCAKITcTh7gO-VwcUzM_jHOjW1lxAECF3_sw/exec`

Si cambia la URL `/exec`, reemplazar `SCRIPT_URL` al inicio de `app.js`.


## Logo nLab
El logo ya no se construye con letras rotadas mediante SVG.
La interfaz utiliza la imagen aprobada en:

`assets/nlab-logo.png`

Así se conserva exactamente la forma y proporción del wordmark.


## Ajuste de identidad nLab
La imagen `assets/nlab-logo.png` ahora incorpora el descriptor
“LABORATORIO DE INNOVACIÓN DE LUPE”.

Por ese motivo, la interfaz ya no repite ese texto debajo del logo.
Solo conserva la descripción:
“Un espacio para investigar, experimentar y transformar insights en nuevas soluciones.”
