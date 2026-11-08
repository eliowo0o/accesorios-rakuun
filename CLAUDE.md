# CLAUDE.md — accesorios-rakuun

Catálogo web de **RAKUUN** (accesorios hechos a mano, CDMX, envíos a todo México). Tienda pública optimizada para Google + carrito que arma un mensaje de WhatsApp + panel `/admin` para un único administrador.

## Antes de hacer cualquier cosa: lee Obsidian

La documentación del proyecto (requerimientos, decisiones, modelo de datos, plan) **no** vive en este repo, vive en la bóveda de Obsidian:

```
/Users/angelcstd/Documents/Obsidian Vault/RAKUUN/
```

1. Empieza por `Índice - RAKUUN.md`; de ahí salta a la nota que necesites.
2. Si necesitas saber **por qué** algo es así, o cómo debe comportarse, búscalo ahí antes de preguntar o asumir:
   - con el CLI (Obsidian abierto): `obsidian search query="<texto>" path="RAKUUN"`; ver la skill `obsidian:obsidian-cli`.
   - o directo: `grep -ril "<texto>" "/Users/angelcstd/Documents/Obsidian Vault/RAKUUN"`.
3. Si tomas o cambias una decisión, **actualiza la nota correspondiente** (formato de la bóveda: IDEA CENTRAL / PRINCIPIO / … / VALOR, `[[wikilinks]]` solo a notas que existan, prefijo `RAKUUN - `, marcar *confirmado (fecha)* vs *propuesto*) y avisa al usuario qué cambiaste.
4. Al terminar una fase, actualiza la tabla de estado en `RAKUUN - Plan maestro.md`.
5. No crees archivos `.md` de documentación dentro de este repo (salvo `README.md` y este `CLAUDE.md`). La doc va a Obsidian.

## Stack

Next.js (App Router) · TypeScript estricto · Tailwind · Supabase (Postgres + Auth vía `@supabase/ssr`) · AWS S3 (URLs prefirmadas) · zod · lucide-react · Vitest · deploy en Vercel.

## Next.js 16.4 — diferente a lo que conoces

Lee `AGENTS.md` y la doc local en `node_modules/next/dist/docs/01-app/` antes de usar una API que no hayas visto aquí. Lo importante:

- **Cache Components activado** (`cacheComponents: true`). Se cachea con la directiva `"use cache"` + `cacheLife()` + `cacheTag()` (`next/cache`). Ver `src/services/catalog.ts`.
- Datos no cacheados o APIs de request (`cookies()`, `headers()`, `searchParams`, `params` desconocidos) **deben ir dentro de `<Suspense>`**, o el build falla con "blocking route".
- Dentro de `"use cache"` no se puede leer `cookies()`: el catálogo público usa un cliente Supabase **sin cookies**; el admin usa el cliente con cookies y no se cachea.
- Invalidación desde Server Actions: `updateTag(tag)` (el admin ve su cambio al instante) o `revalidateTag(tag, "max")`.
- `params` y `searchParams` son **Promises** (`await props.params`). Tipos globales `PageProps<'/ruta/[slug]'>` y `LayoutProps<'/'>`.
- `middleware.ts` ahora se llama **`proxy.ts`** (export `function proxy`).
- `generateStaticParams` para prerenderizar categorías y productos conocidos.

## Reglas de código (no negociables)

- **Diseño atómico:** `src/components/{atoms,molecules,organisms,templates}`. Las páginas en `src/app` solo componen templates/organisms y piden datos a `src/services`.
- **Componentes sin lógica:** reciben props y pintan. Estado, efectos y handlers van en un **custom hook** (`src/hooks/useX.ts`).
- **useReducer + Context** cuando un hook maneja varios estados relacionados o el estado se comparte lejos (carrito). Acciones tipadas, reducer puro y con tests.
- **Server Components por defecto.** `"use client"` solo en las hojas interactivas.
- **Composición > props booleanas** (compound components).
- Los componentes nunca importan Supabase ni AWS; eso vive en `src/services` y `src/lib`.
- Toda escritura del admin es Server Action: verifica sesión de admin + valida con zod + `revalidateTag`.
- IDs UUID; URLs con `slug`.
- Íconos SVG (lucide). **Nunca emojis como íconos de UI** (en el texto del mensaje de WhatsApp sí).
- `next/image` siempre, con `alt` real.
- Precios: `lib/format.ts` (formato `MXN $ 60,00`). Nada de formatear a mano.
- Secretos: solo en `.env.local` / Vercel. Nunca `NEXT_PUBLIC_` para llaves de AWS. Actualiza `.env.example` si agregas una variable.

## Skills del proyecto (`.claude/skills/`)

- `react-best-practices` → al escribir o revisar componentes, páginas y fetch.
- `composition-patterns` → al diseñar la API de un componente reutilizable.
- `web-design-guidelines` → revisión de UI/accesibilidad al cerrar una fase.
- `ui-ux-pro-max` → reglas de UX y checklist pre-entrega. **No** uses su paleta ni tipografía: la identidad está en `RAKUUN - Identidad visual.md`.

## Comandos

```bash
npm run dev      # localhost:3000
npm run build
npm run lint
npm test
```

Antes de dar algo por terminado: `build`, `lint` y `test` en verde.

## Trabajo con agentes

El plan y quién es dueño de qué carpeta está en `RAKUUN - Plan maestro.md`. Si eres un subagente: escribe **solo** en las carpetas de tu agente; si necesitas cambiar un contrato compartido (`src/types`, `src/services/catalog.ts`, `useCart`), no lo cambies, repórtalo.
