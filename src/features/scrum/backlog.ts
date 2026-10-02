import type { UserStory } from './model'

export const backlog: Omit<UserStory, 'tasks'>[] = [
  {
    "id": "HU-01",
    "title": "Mapa interactivo",
    "description": "Como estudiante web, visualizar la ruta de aprendizaje como mapa interactivo para dar a conocer mi avance escolar visualmente.",
    "epic": "Ruta de aprendizaje (web, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-02",
    "title": "Hacer clic en un nivel",
    "description": "Como estudiante web, hacer clic en un nivel del roadmap para iniciar la lección de ese día.",
    "epic": "Ruta de aprendizaje (web, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-03",
    "title": "Regresar al punto exacto del mapa",
    "description": "Como estudiante web, regresar al punto exacto del mapa donde cerré sesión para no perder mi progreso ni repetir lecciones.",
    "epic": "Ruta de aprendizaje (web, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-04",
    "title": "Ver la ruta según las unidades del MINEDU",
    "description": "Como estudiante web, ver la ruta según las unidades del MINEDU para seguir el mismo orden que las clases del colegio.",
    "epic": "Ruta de aprendizaje (web, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-05",
    "title": "Herramienta de gestión y autoría",
    "description": "Como profesor, contar con una herramienta de gestión y autoría para diseñar roadmaps personalizados y asociarlos a mis materiales, adaptando la plataforma a la planificación de las clases presenciales.",
    "epic": "Autoría curricular (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-06",
    "title": "Arrastrar y soltar módulos temáticos",
    "description": "Como profesor, arrastrar y soltar módulos temáticos para reorganizar la secuencia de aprendizaje.",
    "epic": "Autoría curricular (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-07",
    "title": "Subir PDF, enlaces y PPT",
    "description": "Como profesor, subir PDF, enlaces y PPT y enlazarlos a un nodo específico del roadmap.",
    "epic": "Autoría curricular (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-08",
    "title": "Publicar o pausar",
    "description": "Como docente, publicar o pausar la visibilidad de una ruta personalizada para controlar cuándo acceden los alumnos.",
    "epic": "Autoría curricular (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-09",
    "title": "Barra de búsqueda",
    "description": "Como usuario web, una barra de búsqueda por materia para explorar roadmaps alternativos rápidamente.",
    "epic": "Búsqueda y descarga de rutas (web, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-10",
    "title": "Filtros por grado escolar",
    "description": "Como usuario web, aplicar filtros por grado escolar (ej. 3.º o 4.º de primaria) para que la dificultad sea adecuada a mi nivel.",
    "epic": "Búsqueda y descarga de rutas (web, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-11",
    "title": "Ingresar un código alfanumérico",
    "description": "Como usuario web, ingresar un código alfanumérico para unirme al roadmap creado por mi profesor y acceder a la ruta de mi salón.",
    "epic": "Búsqueda y descarga de rutas (web, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-12",
    "title": "Descargar materiales y ejercicios",
    "description": "Como usuario web, descargar materiales y ejercicios del roadmap para estudiar, repasar o imprimir sin conexión.",
    "epic": "Búsqueda y descarga de rutas (web, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-13",
    "title": "Gestionar la calendarización",
    "description": "Como docente, gestionar la calendarización de unidades y fechas de evaluación dentro del roadmap institucional para sincronizar los avances virtuales con el cronograma escolar.",
    "epic": "Calendarización escolar (web, docente)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-14",
    "title": "Enviar recordatorios automáticos",
    "description": "Como profesor, enviar recordatorios automáticos de fechas de evaluación sincronizados con el calendario de la clase.",
    "epic": "Calendarización escolar (web, docente)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-15",
    "title": "Configurar el nivel de asistencia del tutor IA",
    "description": "Como docente, configurar el nivel de asistencia del tutor IA (pistas guiadas o explicación directa) para mi grupo.",
    "epic": "Calendarización escolar (web, docente)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-16",
    "title": "Vincular dinámicamente actividades complementarias",
    "description": "Como docente, vincular dinámicamente actividades complementarias del MINEDU en los nodos donde mis alumnos tengan bajo rendimiento, para nivelar sus competencias.",
    "epic": "Calendarización escolar (web, docente)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-17",
    "title": "Consultar reportes de resultados",
    "description": "Como profesor, consultar reportes de resultados de mis estudiantes para identificar dificultades.",
    "epic": "Analítica del aula (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-18",
    "title": "Ver una tabla con las calificaciones promedio",
    "description": "Como profesor, ver una tabla con las calificaciones promedio del salón por unidad del MINEDU.",
    "epic": "Analítica del aula (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-19",
    "title": "Filtrar resultados por estudiante individual",
    "description": "Como profesor, filtrar resultados por estudiante individual para detectar casos de bajo rendimiento.",
    "epic": "Analítica del aula (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-20",
    "title": "Asignar tareas de refuerzo diferenciadas",
    "description": "Como profesor, asignar tareas de refuerzo diferenciadas a los alumnos que lo necesiten.",
    "epic": "Analítica del aula (web, docente)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-21",
    "title": "Generar cuestionarios cortos asistidos por IA",
    "description": "Como usuario, generar cuestionarios cortos asistidos por IA para poner a prueba lo aprendido desde cualquier aplicativo móvil.",
    "epic": "Recursos de repaso con IA (móvil, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-22",
    "title": "Tarjetas de memoria (flashcards)",
    "description": "Como usuario, tarjetas de memoria (flashcards) que se voltean y responden a gestos táctiles (swipe) para memorizar conceptos clave.",
    "epic": "Recursos de repaso con IA (móvil, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-23",
    "title": "Consultar infografías y resúmenes visuales",
    "description": "Como usuario, consultar infografías y resúmenes visuales generados por la IA para entender temas complejos de matemáticas o lectura de un vistazo.",
    "epic": "Recursos de repaso con IA (móvil, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-24",
    "title": "Optimizados para la pantalla táctil",
    "description": "Como usuario, ver los recursos optimizados para la pantalla táctil para estudiar sin zoom excesivo ni desplazamiento lateral.",
    "epic": "Recursos de repaso con IA (móvil, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-25",
    "title": "Recibir alertas y notificaciones personalizadas",
    "description": "Como estudiante móvil, recibir alertas y notificaciones personalizadas para mantener el hábito de estudio y recordar metas pendientes.",
    "epic": "Notificaciones (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-26",
    "title": "Configurar la hora exacta",
    "description": "Como estudiante móvil, configurar la hora exacta de mis recordatorios diarios.",
    "epic": "Notificaciones (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-27",
    "title": "Recibir notificaciones motivacionales",
    "description": "Como estudiante móvil, recibir notificaciones motivacionales cuando esté a punto de perder mi racha diaria.",
    "epic": "Notificaciones (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-28",
    "title": "Recibir alertas",
    "description": "Como estudiante móvil, recibir alertas cuando el profesor publique o habilite materiales o fechas de examen.",
    "epic": "Notificaciones (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-29",
    "title": "Acumular puntos de experiencia y medallas",
    "description": "Como estudiante móvil, acumular puntos de experiencia y medallas al completar actividades para mantenerme motivado.",
    "epic": "Gamificación (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-30",
    "title": "Visualizar un contador de rachas",
    "description": "Como estudiante móvil, visualizar un contador de rachas junto al avatar de Rupi para comprometerme con un hábito constante.",
    "epic": "Gamificación (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-31",
    "title": "Desbloquear accesorios e insignias",
    "description": "Como estudiante móvil, desbloquear accesorios e insignias para personalizar la mascota.",
    "epic": "Gamificación (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-32",
    "title": "Consultar una tabla de logros del aula",
    "description": "Como estudiante móvil, consultar una tabla de logros del aula para participar en dinámicas de superación sana con mis compañeros.",
    "epic": "Gamificación (móvil, estudiante)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-33",
    "title": "Acceder a un panel principal",
    "description": "Como usuario móvil, acceder a un panel principal con el recuento exacto de lecciones completadas.",
    "epic": "Dashboard de progreso (móvil, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-34",
    "title": "Revisar un indicador gráfico",
    "description": "Como alumno, revisar un indicador gráfico (barra o círculo) para sentir motivación al acercarme a mi meta del día.",
    "epic": "Dashboard de progreso (móvil, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-35",
    "title": "Indicador gráfico de avance diario (duplicada de HU-34)",
    "description": "Historia duplicada de la HU-34 según el documento del curso.",
    "epic": "Dashboard de progreso (móvil, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-36",
    "title": "Comparar mi puntaje de hoy con el de ayer",
    "description": "Como usuario, comparar mi puntaje de hoy con el de ayer para comprobar si supero mi propio ritmo.",
    "epic": "Dashboard de progreso (móvil, estudiante)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-37",
    "title": "Recibir pistas y explicaciones de la IA adaptadas a mi nivel",
    "description": "Como estudiante, recibir pistas y explicaciones de la IA adaptadas a mi nivel para comprender mis errores en los distintos cursos.",
    "epic": "Tutoría inteligente y retos (móvil o web, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-38",
    "title": "Recibir explicaciones con ejemplos de la vida real",
    "description": "Como estudiante, recibir explicaciones con ejemplos de la vida real generados por el tutor virtual.",
    "epic": "Tutoría inteligente y retos (móvil o web, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-39",
    "title": "Escuchar consignas y explicaciones leídas por voz",
    "description": "Como estudiante, escuchar consignas y explicaciones leídas por voz para comprender a través de soporte auditivo.",
    "epic": "Tutoría inteligente y retos (móvil o web, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-40",
    "title": "Acceder a retos diarios",
    "description": "Como estudiante, acceder a retos diarios de razonamiento lógico y comprensión lectora contextualizados a la realidad peruana.",
    "epic": "Tutoría inteligente y retos (móvil o web, estudiante)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-41",
    "title": "Gestionar cuentas",
    "description": "Como administrador, gestionar cuentas (modificaciones, altas y bajas de docentes y alumnos) para mantener un registro ordenado y depurado.",
    "epic": "Cuentas, roles y permisos (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-42",
    "title": "Asignar roles y permisos estrictos",
    "description": "Como administrador, asignar roles y permisos estrictos para restringir el acceso a módulos administrativos o datos de terceros.",
    "epic": "Cuentas, roles y permisos (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-43",
    "title": "Habilitar sesión única sincronizada",
    "description": "Como administrador, habilitar sesión única sincronizada entre web y móvil para evitar accesos simultáneos conflictivos.",
    "epic": "Cuentas, roles y permisos (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-44",
    "title": "Establecer contraseñas y desbloquear cuentas institucionales",
    "description": "Como administrador, establecer contraseñas y desbloquear cuentas institucionales a solicitud, para asegurar la continuidad del acceso.",
    "epic": "Cuentas, roles y permisos (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-45",
    "title": "Monitorear la salud de los servidores",
    "description": "Como administrador, monitorear la salud de los servidores y los tiempos de respuesta para anticipar fallos antes de que afecten las clases.",
    "epic": "Monitoreo y disponibilidad (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-46",
    "title": "Auditar el tráfico entre web y móvil",
    "description": "Como encargado de la plataforma, auditar el tráfico entre web y móvil para garantizar que lecciones y puntajes estén siempre sincronizados.",
    "epic": "Monitoreo y disponibilidad (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-47",
    "title": "Recibir alertas tempranas",
    "description": "Como responsable de infraestructura, recibir alertas tempranas si la IA o la base de datos se caen, para aplicar medidas de emergencia.",
    "epic": "Monitoreo y disponibilidad (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-48",
    "title": "Un tablero centralizado",
    "description": "Como administrador de la arquitectura, un tablero centralizado con uptime y cantidad de errores para evaluar la calidad técnica.",
    "epic": "Monitoreo y disponibilidad (administrador)",
    "priority": "Alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-49",
    "title": "Estructurar el catálogo",
    "description": "Como administrador, estructurar el catálogo de grados, áreas curriculares y competencias del MINEDU para que los roadmaps sigan la normativa.",
    "epic": "Catálogo maestro MINEDU (administrador)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-50",
    "title": "Registrar y modificar metas y estándares",
    "description": "Como administrador, registrar y modificar metas y estándares de aprendizaje por unidad temática.",
    "epic": "Catálogo maestro MINEDU (administrador)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-51",
    "title": "Actualizar la correspondencia curricular",
    "description": "Como administrador, actualizar la correspondencia curricular ante resoluciones ministeriales anuales.",
    "epic": "Catálogo maestro MINEDU (administrador)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-52",
    "title": "Parametrizar los periodos",
    "description": "Como administrador, parametrizar los periodos (bimestrales y trimestrales) según el calendario escolar nacional.",
    "epic": "Catálogo maestro MINEDU (administrador)",
    "priority": "Media",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-53",
    "title": "Configurar reglas estrictas de evaluación de lenguaje",
    "description": "Como administrador, configurar reglas estrictas de evaluación de lenguaje en el motor de IA para frenar respuestas inapropiadas y proteger a los menores.",
    "epic": "Moderación ética de la IA (administrador)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-54",
    "title": "Consultar el historial completo de interacciones",
    "description": "Como supervisor de seguridad, consultar el historial completo de interacciones escolar-tutor virtual para rastrear el uso y detectar comportamientos inusuales.",
    "epic": "Moderación ética de la IA (administrador)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-55",
    "title": "Establecer capas de validación previas",
    "description": "Como gestor de la plataforma, establecer capas de validación previas a las instrucciones que recibe la IA para mitigar jailbreak.",
    "epic": "Moderación ética de la IA (administrador)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-56",
    "title": "Configurar filtros automáticos de palabras y expresiones ofensivas",
    "description": "Como gestor de la plataforma, configurar filtros automáticos de palabras y expresiones ofensivas en el chat para prevenir el acoso escolar.",
    "epic": "Moderación ética de la IA (administrador)",
    "priority": "Muy alta",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-57",
    "title": "Programar respaldos automáticos",
    "description": "Como administrador, programar respaldos automáticos de la base de datos fuera de las horas punta escolares.",
    "epic": "Seguridad, respaldos y privacidad (administrador)",
    "priority": "Sin definir",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-58",
    "title": "Configurar bloqueo automático y límite de intentos de inicio de sesión fallidos",
    "description": "Como administrador, configurar bloqueo automático y límite de intentos de inicio de sesión fallidos contra ataques de fuerza bruta en web y móvil.",
    "epic": "Seguridad, respaldos y privacidad (administrador)",
    "priority": "Sin definir",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-59",
    "title": "Simular escenarios de recuperación ante desastres (DRP)",
    "description": "Como administrador de sistemas, simular escenarios de recuperación ante desastres (DRP) probando la integridad de los respaldos en servidores de prueba aislados.",
    "epic": "Seguridad, respaldos y privacidad (administrador)",
    "priority": "Sin definir",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  },
  {
    "id": "HU-60",
    "title": "Implementar autenticación de doble factor (2FA)",
    "description": "Como administrador, implementar autenticación de doble factor (2FA) obligatoria para cuentas administrativas y docentes.",
    "epic": "Seguridad, respaldos y privacidad (administrador)",
    "priority": "Sin definir",
    "assignee": null,
    "status": "Pendiente",
    "progress": 0
  }
]
