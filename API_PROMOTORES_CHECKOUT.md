# Asignación de ventas a promotores en el checkout

## Qué envía el frontend

En **POST /api/tickets/online/checkout/** el body puede incluir:

- `promoter_code` (opcional): código del promotor cuando el usuario ha entrado por un enlace tipo `?promoter=CODIGO` o ha escrito el código en el formulario.

Ejemplo de body:

```json
{
  "ticket_type_id": 123,
  "quantity": 1,
  "attendee_data": [...],
  "promoter_code": "PROMO2024"
}
```

## Qué debe hacer el backend para asignar la venta al promotor

1. **Al crear el pedido (checkout):** guardar `promoter_code` en la orden. No asignar aún la venta al promotor hasta que el pago esté confirmado.

2. **Cuando el pago se confirme** (webhook de Stripe o flujo interno de confirmación):
   - Si la orden tiene `promoter_code` guardado, resolver el promotor por ese código (p. ej. tabla de promotores donde `code = promoter_code`).
   - Crear o actualizar la relación venta–promotor para que la venta quede asignada a ese promotor y pueda cobrar comisión.

Si `promoter_code` no se persiste en la orden o no se usa al confirmar el pago, la venta nunca se asignará al promotor aunque el frontend lo envíe correctamente.
