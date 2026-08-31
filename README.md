# Sala de estudio — Base de Datos

Aplicación web para estudiar el ramo de Base de Datos de Ingeniería Civil en Computación e Informática (Universidad Central de Chile). Enfocada en modelo relacional, el esquema HR de Oracle y SQL sobre Oracle XE.

No necesita instalación ni servidor: es HTML, CSS y JavaScript sin dependencias.

## Qué incluye

| Sección | Qué hace |
|---|---|
| Esquema HR | Diagrama interactivo de las 7 tablas con claves primarias, foráneas y relaciones. Incluye ejercicio de reconstrucción de memoria. |
| Recuerdo activo | 37 tarjetas filtrables por tema. Las falladas se repiten hasta acertarlas. |
| Consultas | 11 ejercicios de SQL con solución y nota sobre la trampa de cada uno. |
| Preguntas trampa | 12 preguntas de interrogación elaborativa sobre el porqué de cada regla. |
| Explícalo tú | Técnica Feynman: explicar el concepto con tus palabras y contrastar con los puntos clave. |
| Generar prueba | Genera pruebas aleatorias (P1, P2, P3 o examen final) con cronómetro, pauta y nota estimada en escala 1–7. Vive en `prueba.html`, una página aparte que no carga tarjetas, consultas ni apuntes, para que no tengas nada a mano mientras rindes. |
| Cómo estudiar | Métodos de estudio aplicados al ramo y plan de tres semanas. |

Todo lo que escribes se guarda automáticamente en el navegador.

## Cómo usarlo

**Localmente:** clona el repositorio y abre `index.html` en el navegador.

```bash
git clone https://github.com/USUARIO/base-de-datos-ucen.git
cd base-de-datos-ucen
```

**En GitHub Pages:** en el repositorio, ve a *Settings → Pages*, elige la rama `main` y la carpeta raíz `/`. La app queda publicada en `https://USUARIO.github.io/base-de-datos-ucen/`.

## Estructura

```
.
├── index.html          Sala de estudio: esquema, tarjetas, consultas, preguntas trampa, Feynman, método
├── prueba.html          Generador de pruebas, página aparte y sin acceso al resto del material
├── estilos.css          Estilos y sistema de diseño (compartido por ambas páginas)
├── app.js              Lógica de index.html: navegación, tarjetas, cronómetro de reconstrucción, corrección SQL, Feynman
├── examen.js            Lógica de prueba.html: generación de la prueba, cronómetro y autocorrección
├── schema.js           Tablas del esquema HR
├── flashcards.js       Banco de tarjetas
├── consultas.js        Ejercicios de SQL
├── preguntas.js        Preguntas trampa y temas Feynman
├── pruebas.js          Banco de preguntas de prueba (usado solo por prueba.html)
├── apuntes.md          Apuntes completos del ramo
├── .gitignore
├── LICENSE
└── README.md
```

## Agregar contenido

Los bancos de preguntas están separados de la lógica: para ampliarlos basta editar `schema.js`, `flashcards.js`, `consultas.js`, `preguntas.js` o `pruebas.js` sin tocar `app.js` ni `examen.js`.

Agregar una tarjeta en `flashcards.js`:

```js
{t:"SQL básico", q:"¿Pregunta?", a:"Respuesta."}
```

Agregar una pregunta de prueba en `pruebas.js`, dentro del arreglo `"1"`, `"2"` o `"3"` según a qué prueba corresponde:

```js
{q:"Enunciado de la pregunta.", p:15, k:"Pauta de corrección."}
```

`p` son los puntos que vale la pregunta y `k` es la pauta que se muestra al corregir.

## Stack

HTML, CSS y JavaScript sin frameworks ni build. Tipografías: Bricolage Grotesque, IBM Plex Sans e IBM Plex Mono vía Google Fonts.

## Licencia

MIT. Ver [LICENSE](LICENSE).
