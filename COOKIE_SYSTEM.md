# Sistema de Cookies - DAME Valencia

## Descripción
Sistema de gestión de cookies conforme a normativas recientes (RGPD, ePrivacy, LGPD).

## Características Implementadas

### ✅ Cumplimiento Legal
- Banner de cookies visible al primer acceso
- Consentimiento granular (Necesarias, Análisis, Marketing)
- Almacenamiento de preferencias en localStorage
- Opción "Rechazar todas" las cookies opcionales
- Enlace a Política de Privacidad

### ✅ Tipos de Cookies
1. **Necesarias**: Siempre activas, esenciales para el funcionamiento
2. **Análisis**: Recolectan información anónima sobre el uso del sitio
3. **Marketing**: Personalizan la publicidad según intereses

### ✅ Opciones para el Usuario
- **Aceptar todas**: Activa todas las categorías de cookies
- **Rechazar todas**: Solo mantiene las cookies necesarias
- **Personalizar**: Permite elegir individualmente cada categoría

### ✅ Persistencia
Las preferencias se guardan en `localStorage`:
- `dame_cookie_consent`: Confirmación de consentimiento
- `dame_cookie_analytics`: Preferencia de cookies de análisis
- `dame_cookie_marketing`: Preferencia de cookies de marketing

## Uso

### Banner de Cookies
Se muestra automáticamente la primera vez que un usuario accede al sitio. 
El banner desaparece después de que el usuario hace una elección.

### Panel de Configuración
Accesible desde el botón "Personalizar" en el banner. 
Permite ajustar preferencias en cualquier momento.

### Integración de Analytics/Marketing

Para agregar Google Analytics o herramientas similares:

```typescript
// En CookieBanner.tsx, función savePreferences()
if (prefs.analytics) {
  // Inicializar Google Analytics
  window.gtag && window.gtag('config', 'GA_MEASUREMENT_ID');
}

if (prefs.marketing) {
  // Inicializar Facebook Pixel, etc.
  // @ts-ignore
  window.fbq && window.fbq('init', 'PIXEL_ID');
}
```

## Personalización

### Colores y Estilos
Los estilos usan las clases de Tailwind del proyecto:
- `dame-gradient`: Gradiente principal DAME
- `dame-text-gradient`: Texto con gradiente
- Colores purple/pink en modo claro y oscuro

### Textos
Los textos están actualmente en español. Para internacionalización, 
agregar al sistema i18n existente.

## Próximos Pasos

1. Implementar sistema de gestión de cookies real (sustituir console.log)
2. Agregar traducciones para múltiples idiomas
3. Integrar herramientas de analytics reales (Google Analytics, etc.)
4. Configurar herramientas de marketing (Facebook Pixel, etc.)
5. Testing A/B para optimizar tasas de aceptación

## Referencias Legales

- [RGPD - Reglamento General de Protección de Datos](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=celex:32016R0679)
- [Directiva ePrivacy](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32002L0058)
- [LGPD - Brasil](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)




