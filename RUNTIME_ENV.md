# Runtime Environment Variables Configuration

Этот проект использует `next-runtime-env` для получения переменных окружения в **runtime**, а не в build time. Это позволяет создать один Docker образ и использовать его с разными конфигурациями.

## Доступные переменные

### NEXT_PUBLIC_API_URL
URL вашего backend API
- **Обязательная**: Да
- **По умолчанию**: `http://localhost:8080`
- **Пример**: `https://api.yourshop.com`

### NEXT_PUBLIC_SHOP_ID
ID вашего магазина в системе
- **Обязательная**: Да
- **По умолчанию**: `60f7b3b3b3b3b3b3b3b3b3b3`
- **Пример**: `507f1f77bcf86cd799439011`

### NEXT_PUBLIC_BASE_URL
Базовый URL вашего сайта (для SEO и sitemap)
- **Обязательная**: Да
- **По умолчанию**: `https://yourwebsite.com`
- **Пример**: `https://myshop.com`

## Использование в коде

Вместо прямого использования `process.env.NEXT_PUBLIC_*`, используйте наши helper функции:

```typescript
import { getApiUrl, getShopId, getBaseUrl } from '@/lib/env';

// Получить API URL
const apiUrl = getApiUrl();

// Получить Shop ID
const shopId = getShopId();

// Получить Base URL
const baseUrl = getBaseUrl();
```

## Docker Configuration

### Вариант 1: Передача через docker run

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourshop.com \
  -e NEXT_PUBLIC_SHOP_ID=507f1f77bcf86cd799439011 \
  -e NEXT_PUBLIC_BASE_URL=https://myshop.com \
  your-image:latest
```

### Вариант 2: Использование docker-compose

```yaml
version: '3.8'
services:
  webshop:
    image: your-image:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_SHOP_ID=${NEXT_PUBLIC_SHOP_ID}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
```

### Вариант 3: Kubernetes ConfigMap/Secrets

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webshop-config
data:
  NEXT_PUBLIC_API_URL: "https://api.yourshop.com"
  NEXT_PUBLIC_SHOP_ID: "507f1f77bcf86cd799439011"
  NEXT_PUBLIC_BASE_URL: "https://myshop.com"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webshop
spec:
  template:
    spec:
      containers:
      - name: webshop
        image: your-image:latest
        envFrom:
        - configMapRef:
            name: webshop-config
```

## Преимущества этого подхода

✅ **Один образ - много конфигураций**: Соберите один раз, деплойте куда угодно  
✅ **Динамическая конфигурация**: Меняйте настройки без пересборки  
✅ **Tenant isolation**: Каждый tenant может иметь свои настройки  
✅ **CI/CD friendly**: Не нужно передавать secrets в build time  
✅ **Kubernetes ready**: Легко интегрируется с ConfigMaps и Secrets  

## Локальная разработка

Создайте файл `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SHOP_ID=60f7b3b3b3b3b3b3b3b3b3b3
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Как это работает

1. **PublicEnvScript** в `layout.tsx` внедряет script tag в HTML с переменными окружения
2. Переменные становятся доступны через `window.__ENV` на клиенте
3. Функция `env()` из `next-runtime-env` читает их в runtime
4. Наши helper функции (`getApiUrl`, `getShopId`, `getBaseUrl`) предоставляют типобезопасный доступ с fallback значениями

## Миграция из старого подхода

**Было:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Стало:**
```typescript
import { getApiUrl } from '@/lib/env';
const apiUrl = getApiUrl();
```

## Важно!

⚠️ Переменные с префиксом `NEXT_PUBLIC_` теперь читаются в **runtime**, а не в build time  
⚠️ Это значит, что вы можете менять их без пересборки приложения  
⚠️ Убедитесь, что ваш tenant controller передает эти переменные в контейнер при старте  

