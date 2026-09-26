# ==============================================================================
# MANUAL DE USUARIO - Sistema de Proyeccion Social UNIMINUTO
# ==============================================================================

## TABLA DE CONTENIDO
1. Visitante (No autenticado)
2. Usuario Registrado
3. Moderador / Gestor de Contenido
4. Administrador

---

## 1. VISITANTE (No autenticado)

### 1.1 Navegar publicaciones
- Ir a la pagina de inicio `/`
- Las publicaciones destacadas aparecen en la seccion "Publicaciones Recientes"
- Hacer clic en "Explorar Publicaciones" para ver el catalogo completo

### 1.2 Buscar publicaciones
- Ir a `/buscar`
- Escribir en la barra de busqueda (se filtra automaticamente)
- Usar los filtros de la barra lateral:
  - Categorias: seleccionar una categoria
  - Orden: Mas recientes, Mas antiguas, A-Z
- Navegar paginas con los botones de paginacion

### 1.3 Ver detalle de publicacion
- Hacer clic en cualquier tarjeta de publicacion
- Ver: titulo, autor, fecha, categoria, contenido completo
- Ver galeria de imagenes (si existen) con lightbox
- Ver comentarios aprobados
- **Nota:** Para comentar, debe iniciar sesion

---

## 2. USUARIO REGISTRADO

### 2.1 Iniciar sesion
- Ir a la ruta `/login` (o desde el boton de administracion)
- Ingresar usuario y contrasena
- Sesion activa se mantiene en la navegacion

### 2.2 Crear comentario
- Ir al detalle de una publicacion `/publicacion/:id`
- Desplazar a la seccion "Comentarios"
- Escribir comentario en el campo de texto
- Hacer clic en "Enviar comentario"
- El comentario queda en estado **Pendiente** (visible solo para moderadores)
- Recibira notificacion cuando sea aprobado o rechazado

### 2.3 Ver mis comentarios
- Los comentarios aprobados son visibles en la publicacion
- Los comentarios rechazados muestran el motivo (solo para el autor)

---

## 3. MODERADOR / GESTOR DE CONTENIDO (is_staff)

### 3.1 Panel de administracion
- Ir a `/admin` (redirige al Dashboard)
- Usar el sidebar izquierdo para navegar entre modulos

### 3.2 Dashboard (`/admin/dashboard`)
- KPIs: total publicaciones, comentarios, usuarios, pendientes
- Grafico de publicaciones por estado (pie chart)
- Grafico de comentarios por estado (pie chart)
- Top 5 publicaciones mas comentadas (bar chart)

### 3.3 Gestionar publicaciones (`/admin/publicaciones`)
- **Crear:** Boton "Nueva Publicacion" > completar formulario > Guardar
- **Editar:** Icono de lapiz en la tabla
- **Cambiar estado:**
  - Publicar: BORRADOR -> PUBLICADA
  - Despublicar: PUBLICADA -> BORRADOR
  - Archivar: cualquier estado -> ARCHIVADA
- **Eliminar:** Icono de basura > confirmar

### 3.4 Gestionar imagenes (`/admin/imagenes`)
- Seleccionar archivo de imagen
- Asociar a una publicacion
- Agregar nombre y descripcion (opcional)
- Hacer clic en "Subir"
- Las imagenes se almacenan en Supabase Storage

### 3.5 Moderar comentarios (`/admin/comentarios`)
- **Pestana Pendientes:** ver comentarios nuevos
  - Aprobar: boton verde check
  - Rechazar: boton roso X > escribir motivo > confirmar
- **Pestana Aprobados:** historial de comentarios aprobados
- **Pestana Rechazados:** historial con motivos

### 3.6 Reportes (`/admin/reportes`)
- Metricas consolidadas
- Filtros: categoria, estado, rango de fechas
- Boton "Exportar CSV" para descargar datos filtrados

---

## 4. ADMINISTRADOR (is_superuser)

### 4.1 Todo lo del Moderador mas:

### 4.2 Gestionar usuarios (Django Admin)
- Ir a `/admin/` (Django Admin nativo)
- Crear, editar, eliminar usuarios
- Asignar permisos: is_staff, is_superuser
- Gestionar categorias de publicaciones

### 4.3 Configuracion del sistema
- Variables de entorno en el servidor
- Gestion de bucket Supabase
- Revision de logs de errores

---

## GLOSARIO
| Termino | Significado |
|---|---|
| BORRADOR | Publicacion no visible publicamente |
| PUBLICADA | Publicacion visible en el portal |
| ARCHIVADA | Publicacion retirada permanentemente |
| PENDIENTE | Comentario esperando moderacion |
| APROBADO | Comentario visible publicamente |
| RECHAZADO | Comentario rechazado con motivo |
| EN_REVISION | Propuesta enviada al administrador para su evaluacion |
