# Cómo contribuir

Gracias por tu interés en mejorar **Tickets WMS**. Toda contribución es bienvenida: reportes de errores, traducciones, documentación y código.

## Antes de empezar

- Para errores o ideas, abre un [issue](https://github.com/jmobandod2000/tickets-app/issues) con la plantilla correspondiente.
- Para cambios grandes, abre primero un issue y acordemos el enfoque, así nadie pierde tiempo.
- Nunca incluyas datos reales de tu empresa (tickets, nombres, documentos, credenciales) en issues, capturas o código.

## Flujo de trabajo

1. Haz un fork y crea una rama desde `main`: `feat/nombre-corto` o `fix/nombre-corto`.
2. Levanta el proyecto siguiendo el [README](README.md#instalación-para-desarrollo).
3. Haz tus cambios respetando el estilo del código:
   - Módulos por carpeta con `index.ts`, identificadores en inglés y sin comentarios en el código fuente.
   - Todo texto visible va en los tres diccionarios del front (`src/i18n/es.ts`, `en-US.ts`, `pt-BR.ts`) y, si es un mensaje del API, en `tickets-back/src/i18n/messages`.
   - Si cambias el esquema de Prisma, incluye la migración (`pnpm db:migrate`).
4. Verifica antes de enviar:
   - Front: `pnpm lint` y `pnpm typecheck`.
   - Back: `pnpm lint`, `pnpm build` y, con la API corriendo, `scripts/smoke-test.ps1`.
5. Firma tus commits con `git commit -s` ([Developer Certificate of Origin](https://developercertificate.org/)) y abre el pull request.

## Licencia de las contribuciones

Al enviar un pull request aceptas que tu contribución se publique bajo la [licencia Apache 2.0](LICENSE) del proyecto, como indica su sección 5. Tu autoría queda registrada en el historial de Git.

## Créditos y colaboraciones económicas

- El proyecto fue creado y es mantenido por **Juan M. Obando**. El archivo [NOTICE](NOTICE) debe conservarse en cualquier redistribución o versión derivada.
- Los únicos canales oficiales para apoyar económicamente el proyecto son los que aparecen en la sección [Apoya el proyecto](README.md#apoya-el-proyecto) de este repositorio y en la pantalla **Acerca de** de la app.
- Los pull requests que cambien o agreguen métodos de pago, enlaces de donación o datos del autor no serán aceptados.
