# CLAUDE.md — TheElevatorShop

## Descripción del Proyecto

**TheElevatorShop** es una plataforma e-commerce especializada en la venta de piezas y repuestos para elevadores. El sitio web debe ofrecer una experiencia de compra fluida y eficiente, inspirada en la navegación de productos de Amazon y eBay, adaptada al nicho industrial de elevadores.

\---

## Stack Tecnológico

|Capa|Tecnología|
|-|-|
|**Frontend**|Next.js 14+ (App Router) con React 18+ y TypeScript|
|**Estilos**|Tailwind CSS v3 + CSS variables para temas|
|**Autenticación**|Supabase Auth (email/password + OAuth)|
|**Base de datos**|Supabase (PostgreSQL) — perfiles de usuario, carritos, órdenes|
|**Inventario / Productos**|Zoho Inventory API — fuente de verdad del catálogo|
|**Pagos**|Stripe Checkout + Stripe Webhooks|
|**Hosting**|Netlify |

\---

## Estructura de Carpetas

```
the-elevator-shop/
├── public/
│   ├── logo.jpeg                  # Logo de la empresa
│   └── images/                    # Imágenes estáticas
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout raíz con providers
│   │   ├── page.tsx               # Landing / Home
│   │   ├── globals.css            # Variables CSS globales + Tailwind
│   │   ├── products/
│   │   │   ├── page.tsx           # Catálogo con filtros y búsqueda
│   │   │   └── \[slug]/
│   │   │       └── page.tsx       # Detalle de producto
│   │   ├── cart/
│   │   │   └── page.tsx           # Carrito de compras
│   │   ├── checkout/
│   │   │   ├── page.tsx           # Página de checkout (Stripe)
│   │   │   └── success/
│   │   │       └── page.tsx       # Confirmación de compra
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Inicio de sesión
│   │   │   ├── register/
│   │   │   │   └── page.tsx       # Registro de cuenta
│   │   │   └── callback/
│   │   │       └── route.ts       # Callback de Supabase OAuth
│   │   ├── account/
│   │   │   ├── page.tsx           # Dashboard del usuario
│   │   │   ├── orders/
│   │   │   │   └── page.tsx       # Historial de compras
│   │   │   └── settings/
│   │   │       └── page.tsx       # Configuración de perfil
│   │   └── api/
│   │       ├── products/
│   │       │   └── route.ts       # Proxy hacia Zoho Inventory
│   │       ├── checkout/
│   │       │   └── route.ts       # Crear sesión de Stripe Checkout
│   │       ├── webhooks/
│   │       │   └── stripe/
│   │       │       └── route.ts   # Webhook de Stripe (confirmar pagos)
│   │       └── zoho/
│   │           ├── sync/
│   │           │   └── route.ts   # Sincronización de inventario
│   │           └── auth/
│   │               └── route.ts   # Refresh de tokens Zoho
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Navbar con logo, búsqueda, carrito, auth
│   │   │   ├── Footer.tsx         # Footer con links e info de contacto
│   │   │   └── Sidebar.tsx        # Filtros laterales (categorías, precio)
│   │   ├── products/
│   │   │   ├── ProductCard.tsx    # Tarjeta de producto en grid
│   │   │   ├── ProductGrid.tsx    # Grid responsivo de productos
│   │   │   ├── ProductDetail.tsx  # Vista detallada del producto
│   │   │   ├── SearchBar.tsx      # Barra de búsqueda con autocompletado
│   │   │   └── Filters.tsx        # Componente de filtros (categoría, marca, precio)
│   │   ├── cart/
│   │   │   ├── CartItem.tsx       # Línea del carrito
│   │   │   ├── CartSummary.tsx    # Resumen y totales
│   │   │   └── CartDrawer.tsx     # Drawer lateral del carrito
│   │   ├── checkout/
│   │   │   └── CheckoutForm.tsx   # Formulario pre-checkout
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx      # Formulario de login
│   │   │   └── RegisterForm.tsx   # Formulario de registro
│   │   └── ui/
│   │       ├── Button.tsx         # Botón reutilizable
│   │       ├── Input.tsx          # Input reutilizable
│   │       ├── Badge.tsx          # Badge para estados/categorías
│   │       ├── Skeleton.tsx       # Loading skeleton
│   │       ├── Modal.tsx          # Modal genérico
│   │       └── Toast.tsx          # Notificaciones toast
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Cliente Supabase (browser)
│   │   │   ├── server.ts          # Cliente Supabase (server-side)
│   │   │   └── middleware.ts      # Middleware de auth para rutas protegidas
│   │   ├── stripe/
│   │   │   ├── client.ts          # Stripe client-side (loadStripe)
│   │   │   └── server.ts          # Stripe server-side (new Stripe())
│   │   ├── zoho/
│   │   │   ├── client.ts          # Cliente API Zoho Inventory
│   │   │   ├── auth.ts            # Manejo de OAuth tokens de Zoho
│   │   │   └── types.ts           # Tipos de datos de Zoho
│   │   └── utils/
│   │       ├── formatters.ts      # Formateo de precios, fechas, etc.
│   │       └── constants.ts       # Constantes globales
│   ├── hooks/
│   │   ├── useCart.ts             # Hook del carrito (estado global)
│   │   ├── useAuth.ts            # Hook de autenticación
│   │   ├── useProducts.ts         # Hook de productos con búsqueda/filtros
│   │   └── useDebounce.ts         # Debounce para búsqueda
│   ├── context/
│   │   ├── CartContext.tsx         # Provider del carrito
│   │   └── AuthContext.tsx         # Provider de autenticación
│   ├── types/
│   │   ├── product.ts             # Tipos de producto
│   │   ├── cart.ts                # Tipos del carrito
│   │   ├── order.ts               # Tipos de orden
│   │   └── user.ts                # Tipos de usuario
│   └── middleware.ts              # Next.js middleware (protección de rutas)
├── supabase/
│   └── migrations/
│       ├── 001\_create\_profiles.sql
│       ├── 002\_create\_orders.sql
│       ├── 003\_create\_cart.sql
│       └── 004\_create\_rls\_policies.sql
├── .env.local.example             # Template de variables de entorno
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── claude.md                      # ESTE ARCHIVO
```

\---

## Diseño y Estética

### Filosofía de Diseño

* **Moderno y minimalista** con fondo blanco predominante
* **Colores extraídos del logo** de TheElevatorShop como acentos
* **Navegación de productos tipo marketplace**: grid denso, filtros laterales, búsqueda prominente
* **Tipografía limpia**: usar una fuente display distintiva para headings (ej: `DM Sans`, `Outfit`, o `Satoshi`) y una sans-serif refinada para body text
* **Sin decoración innecesaria**: cada elemento visual debe tener un propósito funcional

### Variables CSS (definir en `globals.css`)

```css
:root {
  /\* Extraer estos colores del logo real una vez disponible \*/
  --color-primary: #1A1A2E;       /\* Azul oscuro / navy — ajustar según logo \*/
  --color-primary-light: #16213E;
  --color-accent: #E94560;         /\* Acento fuerte — ajustar según logo \*/
  --color-accent-light: #FF6B6B;
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F8F9FA;
  --color-text: #1A1A2E;
  --color-text-secondary: #6C757D;
  --color-border: #E9ECEF;
  --color-success: #28A745;
  --color-warning: #FFC107;
  --color-error: #DC3545;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
}
```

### Guía de Componentes UI

* **ProductCard**: imagen cuadrada o 4:3, nombre del producto, SKU, precio, botón "Add to Cart". Hover sutil con elevación de sombra.
* **Header**: sticky, fondo blanco con borde inferior sutil. Logo a la izquierda, barra de búsqueda centrada expandible, iconos de carrito y usuario a la derecha.
* **Filtros**: sidebar colapsable en mobile, persistente en desktop. Categorías tipo checkbox, rango de precio con slider, filtro por marca/fabricante.
* **Carrito**: drawer lateral (no página separada) con resumen de items y botón de checkout prominente. También accesible como página completa.

\---

## Integraciones — Detalles Técnicos

### 1\. Supabase (Autenticación + Base de Datos)

#### Configuración

```env
NEXT\_PUBLIC\_SUPABASE\_URL=https://xxxxx.supabase.co
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJhbGci...
SUPABASE\_SERVICE\_ROLE\_KEY=eyJhbGci...
```

#### Esquema de Base de Datos (Supabase PostgreSQL)

```sql
-- Perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full\_name TEXT,
  company\_name TEXT,
  phone TEXT,
  shipping\_address JSONB,
  billing\_address JSONB,
  created\_at TIMESTAMPTZ DEFAULT NOW(),
  updated\_at TIMESTAMPTZ DEFAULT NOW()
);

-- Órdenes
CREATE TABLE public.orders (
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,
  user\_id UUID REFERENCES public.profiles(id) NOT NULL,
  stripe\_session\_id TEXT UNIQUE,
  stripe\_payment\_intent TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  items JSONB NOT NULL,            -- snapshot de los items al momento de compra
  subtotal INTEGER NOT NULL,       -- en centavos
  tax INTEGER DEFAULT 0,
  shipping INTEGER DEFAULT 0,
  total INTEGER NOT NULL,          -- en centavos
  shipping\_address JSONB,
  zoho\_sales\_order\_id TEXT,        -- referencia a Zoho
  created\_at TIMESTAMPTZ DEFAULT NOW(),
  updated\_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carrito persistente (para usuarios logueados)
CREATE TABLE public.cart\_items (
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,
  user\_id UUID REFERENCES public.profiles(id) NOT NULL,
  zoho\_item\_id TEXT NOT NULL,      -- ID del producto en Zoho Inventory
  quantity INTEGER NOT NULL DEFAULT 1,
  created\_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user\_id, zoho\_item\_id)
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart\_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user\_id);
CREATE POLICY "Users can view own cart" ON public.cart\_items FOR ALL USING (auth.uid() = user\_id);
```

#### Flujo de Auth

1. Usuario se registra → Supabase Auth crea entrada en `auth.users`
2. Trigger en Supabase crea fila en `public.profiles` automáticamente
3. Login devuelve JWT → se almacena en cookie httpOnly via middleware
4. Middleware de Next.js verifica sesión en rutas protegidas (`/account/\*`, `/checkout`)
5. Usuarios no logueados pueden navegar productos y tener carrito local (localStorage), al loguearse se sincroniza con `cart\_items`

### 2\. Zoho Inventory (Catálogo de Productos)

#### Configuración

```env
ZOHO\_CLIENT\_ID=1000.xxxx
ZOHO\_CLIENT\_SECRET=xxxx
ZOHO\_REFRESH\_TOKEN=1000.xxxx
ZOHO\_ORGANIZATION\_ID=xxxx
ZOHO\_API\_BASE\_URL=https://www.zohoapis.com/inventory/v1
```

#### Endpoints principales a consumir

* `GET /items` — Listar productos (con paginación)
* `GET /items/{item\_id}` — Detalle de producto
* `GET /items?search\_text={query}` — Búsqueda
* `GET /itemgroups` — Categorías/grupos
* `POST /salesorders` — Crear orden de venta (post-pago)
* `GET /items/{item\_id}` → campo `available\_stock` para verificar stock

#### Estrategia de Sincronización

* **NO duplicar el catálogo completo en Supabase**. Zoho es la fuente de verdad.
* Usar API routes de Next.js como proxy: `/api/products` → llama a Zoho API.
* Implementar **caché en memoria o Redis** (ISR/revalidación de Next.js) para reducir llamadas:

  * Listado de productos: revalidar cada 5 minutos
  * Detalle de producto: revalidar cada 2 minutos
  * Stock disponible: verificar en tiempo real solo al hacer checkout
* Al crear un carrito/orden, guardar `zoho\_item\_id` como referencia.

#### Mapeo de datos Zoho → Frontend

```typescript
interface Product {
  id: string;                    // zoho item\_id
  name: string;                  // item\_name
  slug: string;                  // generado desde name (kebab-case)
  sku: string;                   // sku
  description: string;           // description
  price: number;                 // rate (en centavos para Stripe)
  compareAtPrice?: number;       // precio anterior si hay descuento
  category: string;              // group\_name o category
  brand: string;                 // brand o manufacturer
  images: string\[];              // image\_document\_id → URL
  stock: number;                 // available\_stock
  specifications: Record<string, string>; // custom\_fields
  isActive: boolean;             // status === 'active'
}
```

### 3\. Stripe (Pagos)

#### Configuración

```env
NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY=pk\_live\_xxxx
STRIPE\_SECRET\_KEY=sk\_live\_xxxx
STRIPE\_WEBHOOK\_SECRET=whsec\_xxxx
```

#### Flujo de Pago Completo

1. Usuario llena carrito → click "Checkout"
2. Frontend envía items del carrito a `/api/checkout`
3. API route:
a. Verifica stock en tiempo real contra Zoho Inventory
b. Calcula precios actuales desde Zoho (no confiar en precios del frontend)
c. Crea `Stripe Checkout Session` con line\_items
d. Crea orden en Supabase con status `pending`
e. Retorna `session.url` al frontend
4. Frontend redirige a Stripe Checkout (hosted)
5. Post-pago → Stripe dispara webhook a `/api/webhooks/stripe`
6. Webhook handler:
a. Verifica firma del webhook
b. Actualiza orden en Supabase → status `paid`
c. Crea Sales Order en Zoho Inventory
d. Opcionalmente envía email de confirmación

#### Código de referencia — API Route de Checkout

```typescript
// src/app/api/checkout/route.ts
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getZohoItems } from '@/lib/zoho/client';

const stripe = new Stripe(process.env.STRIPE\_SECRET\_KEY!);

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items } = await req.json();
  // items: Array<{ zoho\_item\_id: string, quantity: number }>

  // 1. Verificar stock y obtener precios actuales de Zoho
  const zohoItems = await getZohoItems(items.map(i => i.zoho\_item\_id));
  
  const lineItems = items.map(item => {
    const zohoItem = zohoItems.find(z => z.item\_id === item.zoho\_item\_id);
    if (!zohoItem || zohoItem.available\_stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${zohoItem?.name}`);
    }
    return {
      price\_data: {
        currency: 'usd',
        product\_data: {
          name: zohoItem.name,
          description: zohoItem.sku,
          images: zohoItem.image\_url ? \[zohoItem.image\_url] : \[],
        },
        unit\_amount: Math.round(zohoItem.rate \* 100), // centavos
      },
      quantity: item.quantity,
    };
  });

  // 2. Crear sesión de Stripe Checkout
  const session = await stripe.checkout.sessions.create({
    payment\_method\_types: \['card'],
    line\_items: lineItems,
    mode: 'payment',
    success\_url: `${process.env.NEXT\_PUBLIC\_APP\_URL}/checkout/success?session\_id={CHECKOUT\_SESSION\_ID}`,
    cancel\_url: `${process.env.NEXT\_PUBLIC\_APP\_URL}/cart`,
    customer\_email: user.email,
    metadata: {
      user\_id: user.id,
      zoho\_items: JSON.stringify(items),
    },
  });

  // 3. Crear orden pendiente en Supabase
  await supabase.from('orders').insert({
    user\_id: user.id,
    stripe\_session\_id: session.id,
    status: 'pending',
    items: zohoItems.map(z => ({
      zoho\_item\_id: z.item\_id,
      name: z.name,
      sku: z.sku,
      price: z.rate,
      quantity: items.find(i => i.zoho\_item\_id === z.item\_id)!.quantity,
    })),
    total: session.amount\_total!,
  });

  return Response.json({ url: session.url });
}
```

#### Código de referencia — Webhook de Stripe

```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { createZohoSalesOrder } from '@/lib/zoho/client';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE\_SECRET\_KEY!);
const supabase = createClient(
  process.env.NEXT\_PUBLIC\_SUPABASE\_URL!,
  process.env.SUPABASE\_SERVICE\_ROLE\_KEY! // service role para webhooks
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE\_WEBHOOK\_SECRET!);
  } catch (err) {
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1. Actualizar orden en Supabase
    const { data: order } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        stripe\_payment\_intent: session.payment\_intent as string 
      })
      .eq('stripe\_session\_id', session.id)
      .select()
      .single();

    // 2. Crear Sales Order en Zoho Inventory
    if (order) {
      const zohoOrderId = await createZohoSalesOrder(order);
      await supabase
        .from('orders')
        .update({ zoho\_sales\_order\_id: zohoOrderId })
        .eq('id', order.id);
    }

    // 3. Limpiar carrito del usuario
    await supabase
      .from('cart\_items')
      .delete()
      .eq('user\_id', session.metadata!.user\_id);
  }

  return Response.json({ received: true });
}
```

\---

## Variables de Entorno (.env.local)

```env
# === Supabase ===
NEXT\_PUBLIC\_SUPABASE\_URL=
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=
SUPABASE\_SERVICE\_ROLE\_KEY=

# === Stripe ===
NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY=
STRIPE\_SECRET\_KEY=
STRIPE\_WEBHOOK\_SECRET=

# === Zoho Inventory ===
ZOHO\_CLIENT\_ID=
ZOHO\_CLIENT\_SECRET=
ZOHO\_REFRESH\_TOKEN=
ZOHO\_ORGANIZATION\_ID=
ZOHO\_API\_BASE\_URL=https://www.zohoapis.com/inventory/v1

# === App ===
NEXT\_PUBLIC\_APP\_URL=http://localhost:3000
```

\---

## Reglas de Desarrollo para Claude Code

### Convenciones de Código

1. **TypeScript estricto** en todo el proyecto. Sin `any` explícitos.
2. **Server Components por defecto**. Usar `"use client"` solo cuando sea necesario (interactividad, hooks de browser).
3. **API Routes** (Route Handlers) para toda comunicación con servicios externos (Zoho, Stripe). NUNCA exponer claves secretas al cliente.
4. **Error handling**: try/catch en todas las llamadas a APIs externas. Mostrar errores amigables al usuario vía toasts.
5. **Loading states**: usar Suspense + Skeleton en toda carga de datos.
6. **Responsivo**: mobile-first. Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`.

### Seguridad

* Validar TODOS los precios server-side contra Zoho antes de crear sesiones de Stripe. Nunca confiar en precios enviados desde el frontend.
* Verificar firma de webhooks de Stripe siempre.
* RLS habilitado en todas las tablas de Supabase.
* Service Role Key solo en server-side (API routes y webhooks).
* Sanitizar inputs de búsqueda antes de enviar a Zoho API.

### Orden de Implementación Recomendado

1. **Fase 1 — Fundación**: Setup Next.js + Tailwind + estructura de carpetas + componentes UI base + layout (Header, Footer)
2. **Fase 2 — Auth**: Integrar Supabase Auth (registro, login, middleware de rutas protegidas, perfil)
3. **Fase 3 — Productos**: Integrar Zoho Inventory API (listado, búsqueda, filtros, detalle de producto)
4. **Fase 4 — Carrito**: Implementar carrito (localStorage para guests, Supabase para logueados, sincronización)
5. **Fase 5 — Checkout**: Integrar Stripe Checkout + webhooks + creación de órdenes
6. **Fase 6 — Account**: Dashboard de usuario, historial de órdenes, configuración
7. **Fase 7 — Polish**: Optimización, SEO, accesibilidad, pruebas

### Dependencias Clave

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.1.0",
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "zustand": "^4.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

\---

## Assets

* **Logo**: Ubicado en `public/logo.jpeg` (copiar desde la ubicación original del cliente)
* Extraer colores del logo y actualizar las CSS variables en `globals.css` antes de comenzar el diseño

\---

## Notas Importantes

* El carrito para **usuarios no logueados** se maneja con `localStorage` + Zustand. Al hacer login, se sincroniza automáticamente con la tabla `cart\_items` de Supabase.
* **Zoho Inventory es la fuente de verdad** para productos, precios y stock. No duplicar datos de productos en Supabase.
* Los **precios se manejan en centavos** (integers) para evitar errores de punto flotante. Stripe requiere centavos.
* Toda la **lógica de precios y validación de stock** ocurre server-side en API routes.
* Para **ambientes de desarrollo**, usar `Stripe Test Mode` y crear productos de prueba en Zoho.

