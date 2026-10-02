# Rupi · espacio del equipo

Aplicación Scrum del equipo de Rupi (Jesús Rocha, Erick Gamarra y José Contreras). Reúne historias de usuario con tareas, reuniones con enlace Meet, avances, sprints y commits del repositorio en un solo tablero.

## Arquitectura

- React + TypeScript + Vite para la interfaz.
- API Node.js + Express para autenticación y persistencia.
- MySQL con tablas relacionadas y normalizadas para historias, tareas, reuniones, asistentes, sprints, historias por sprint y avances.
- Sesión en cookie HttpOnly, código compartido del equipo y selección del integrante.
- Guardado automático, sincronización entre integrantes cada 10 segundos y control de versión para detectar escrituras simultáneas.

## Desarrollo local

1. Instala dependencias con `npm install`.
2. Copia `.env.example` como `.env` y completa la URL de una base MySQL accesible desde tu equipo, un código de acceso largo y una clave de sesión aleatoria.
3. Inicia la API con `npm run dev:api`.
4. En otra terminal, inicia Vite con `npm run dev`.

Vite reenvía `/api` a la API local. Al entrar por primera vez, los datos iniciales del backlog se copian a MySQL. Los secretos solo van en `.env` o en la configuración privada del proveedor; nunca se suben al repositorio.

## Publicación

El archivo `render.yaml` prepara el servidor web y el frontend compilado para Render. Crea primero una base MySQL con TLS, introduce `DATABASE_URL` durante la creación del servicio y conecta este proyecto a Render. Render genera el código compartido y la clave de sesión y asigna un subdominio gratuito `onrender.com`. Consulta el valor de `TEAM_ACCESS_CODE` en la configuración privada del servicio para compartirlo con el equipo.

El servidor web gratuito se duerme tras 15 minutos sin actividad y puede tardar alrededor de un minuto en responder al siguiente acceso. Aiven ofrece un MySQL gratuito con 1 GB de disco, pero puede apagar la instancia si no registra actividad continua. Esto sirve para una demostración del equipo; para depender de la plataforma a diario, conviene un plan con disponibilidad y copias de seguridad garantizadas.

## Scripts

- `npm run dev`: interfaz local.
- `npm run dev:api`: API local.
- `npm run build`: verifica TypeScript y compila el frontend.
- `npm run lint`: analiza el código con ESLint.
- `npm start`: inicia la API y sirve `dist` en producción.

El esquema relacional está en `server/schema.sql` y el servidor lo inicializa al arrancar.
