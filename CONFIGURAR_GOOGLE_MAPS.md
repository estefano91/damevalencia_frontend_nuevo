# Cómo configurar Google Maps embebido (Google Cloud)

Si ves el error **"Esta página no puede cargar Google Maps correctamente"** en la página de detalle del evento, hay que revisar la configuración en Google Cloud. Sigue estos pasos.

---

## 1. Entrar en Google Cloud Console

1. Ve a **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Inicia sesión con la cuenta de Google que usa el proyecto.
3. Selecciona el **proyecto** donde está tu API key (o crea uno nuevo).

---

## 2. Activar facturación

Google Maps requiere una **cuenta de facturación** asociada al proyecto (tienen crédito gratuito mensual).

1. En el menú lateral: **Facturación** → **Información de facturación**.
2. Si no hay cuenta vinculada: **Vincular una cuenta de facturación** y completa los datos.
3. El **crédito gratuito** suele cubrir un uso normal de Maps (miles de cargas al mes sin coste).

---

## 3. Activar la API necesaria

1. En el menú lateral: **APIs y servicios** → **Biblioteca**.
2. Busca **"Maps JavaScript API"**.
3. Entra en **Maps JavaScript API** y pulsa **Activar**.

Solo hace falta esta API para el mapa embebido en la web.

---

## 4. Revisar o crear la API key

1. **APIs y servicios** → **Credenciales**.
2. En **Claves de API**, localiza la clave que usas en la app (la que está en `VITE_GOOGLE_MAPS_API_KEY`).
3. Si no tienes ninguna, pulsa **+ Crear credenciales** → **Clave de API**.
4. Copia la clave y guárdala en tu `.env` / `.env.production` como:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
   ```

---

## 5. Restricciones de la API key (recomendado)

Para que solo tu web use la clave:

1. En **Credenciales**, haz clic en el **nombre** de tu API key.
2. En **Restricciones de aplicación**:
   - Elige **Referentes HTTP (sitios web)**.
   - Añade los dominios permitidos, uno por línea, por ejemplo:
     ```
     https://damevalencianuevo.web.app/*
     https://*.damevalencianuevo.web.app/*
     http://localhost:*
     http://127.0.0.1:*
     ```
3. En **Restricciones de API**:
   - Elige **Restringir clave**.
   - Marca solo **Maps JavaScript API**.
4. Guarda los cambios.

---

## 6. Comprobar en la app

1. Asegúrate de que en el entorno que usas (desarrollo o producción) está definida la variable:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=tu_clave_aqui
   ```
2. En producción (Firebase Hosting), configura la variable en **Firebase** → **Tu proyecto** → **Configuración del proyecto** → **Configuración de la compilación** (o en el workflow de despliegue que uses) para que `VITE_GOOGLE_MAPS_API_KEY` esté disponible en el build.
3. Haz un **build y despliegue** de nuevo y recarga la página del evento.

---

## Resumen rápido

| Paso | Dónde | Qué hacer |
|------|--------|-----------|
| 1 | Cloud Console | Proyecto correcto |
| 2 | Facturación | Cuenta de facturación vinculada |
| 3 | APIs y servicios → Biblioteca | Activar **Maps JavaScript API** |
| 4 | Credenciales | Crear o copiar API key → ponerla en `VITE_GOOGLE_MAPS_API_KEY` |
| 5 | Editar la API key | Restricciones: referentes HTTP + solo Maps JavaScript API |
| 6 | App | Variable en .env y en el build de producción |

Si tras esto el mapa sigue sin cargar, revisa la **consola del navegador** (F12 → pestaña Consola) para ver el mensaje de error exacto que devuelve la API de Google Maps.
