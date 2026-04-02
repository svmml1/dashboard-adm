# Dashboard do Organizador — Guia de Integração

Base URL produção: `https://api-3sxev7xp7q-uc.a.run.app`

---

## Autenticação

Todas as rotas exigem o header:
```
Authorization: Bearer {token}
```

Login para obter o token:

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "email@parque.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "PZAznWeQMM7ZRdhLCl8Q",
      "name": "admin",
      "email": "email@parque.com",
      "role": "admin"
    }
  }
}
```

> O `token` deve ser enviado em todas as chamadas como `Authorization: Bearer {token}`.

---

## ⚠️ Pré-requisito: evento precisa ter `organizerId`

Eventos criados **antes** de 02/04/2026 não têm `organizerId`. Eles **não aparecem** em `meus-eventos` e retornam erro 403 em `vendas/:eventId`.

**Para vincular um evento antigo ao parque, use (somente admin):**

```http
PATCH /api/wallet/admin/evento/{eventId}/organizador
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "organizerId": "PZAznWeQMM7ZRdhLCl8Q"
}
```

Resposta:
```json
{
  "success": true,
  "message": "Evento 8PSxxFQJZboSjV7FlZRJ vinculado ao organizador PZAznWeQMM7ZRdhLCl8Q"
}
```

Eventos **novos** já recebem o `organizerId` automaticamente na criação.

---

## 1. Meus Eventos

Lista todos os eventos onde `organizerId` é igual ao `userId` do token.

```http
GET /api/wallet/meus-eventos
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": "8PSxxFQJZboSjV7FlZRJ",
      "nome": "5ª Vaquejada Genesio Araujo",
      "status": "active",
      "local": "5ª Vaquejada Genesio Araujo",
      "startDate": { "_seconds": 1754352000, "_nanoseconds": 0 },
      "endDate":   { "_seconds": 1754697600, "_nanoseconds": 0 },
      "valorSenha": 900
    }
  ]
}
```

> `startDate` e `endDate` vêm como objeto Firestore Timestamp. Converter no front:
> ```js
> new Date(startDate._seconds * 1000).toLocaleDateString('pt-BR')
> ```

---

## 2. Relatório de Vendas de um Evento

Retorna todas as senhas do evento com resumo financeiro por dia e por método.
**Retorna 403 se o evento não pertencer ao organizador do token.**

```http
GET /api/wallet/vendas/{eventId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "evento": {
    "id": "8PSxxFQJZboSjV7FlZRJ",
    "nome": "5ª Vaquejada Genesio Araujo",
    "status": "active",
    "local": "5ª Vaquejada Genesio Araujo",
    "startDate": { "_seconds": 1754352000, "_nanoseconds": 0 },
    "endDate":   { "_seconds": 1754697600, "_nanoseconds": 0 },
    "valorSenha": 900
  },
  "resumo": {
    "totalVendas": 6,
    "totalPagas": 6,
    "totalAguardando": 0,
    "totalArrecadadoBruto": 5400.00,
    "taxaPlataforma": 162.00,
    "totalLiquido": 5238.00,
    "resumoPorDia": {
      "quarta-feira": { "pagas": 2, "aguardando": 0, "arrecadado": 1800.00 },
      "quinta-feira": { "pagas": 2, "aguardando": 0, "arrecadado": 1800.00 },
      "sexta-feira":  { "pagas": 1, "aguardando": 0, "arrecadado": 900.00 },
      "sabado":       { "pagas": 1, "aguardando": 0, "arrecadado": 900.00 }
    },
    "resumoPorMetodo": {
      "PIX_EFI": 3600.00,
      "Direto":  1800.00
    }
  },
  "vendas": [
    {
      "dia": "quarta-feira",
      "senha": 25,
      "vaqueiro": "João Silva",
      "categoria": "Profissional",
      "cavaloPuxa": "Relâmpago RMV",
      "cavaloEsteira": "Trovão do Vale",
      "nomeEsteira": "Haras Estrela",
      "userId": "lDBqQYavevsxwFOCmR6M",
      "paymentId": "VAQ1775089018420XPYBQX813G",
      "metodoPagamento": "PIX_EFI",
      "statusPagamento": "PAGO",
      "valor": 900,
      "horario": "2026-04-02T18:19:32.000Z",
      "pagamentoConfirmadoEm": "2026-04-02T18:19:55.000Z"
    },
    {
      "dia": "quinta-feira",
      "senha": 170,
      "vaqueiro": "Pedro Santos",
      "categoria": "Amador",
      "cavaloPuxa": "Cavalo A",
      "cavaloEsteira": "Cavalo B",
      "nomeEsteira": "Haras XYZ",
      "userId": "lDBqQYavevsxwFOCmR6M",
      "paymentId": null,
      "metodoPagamento": "Direto",
      "statusPagamento": "PAGO",
      "valor": 0,
      "horario": "2026-04-02T18:19:33.000Z",
      "pagamentoConfirmadoEm": null
    }
  ]
}
```

**Sobre `metodoPagamento`:**

| Valor | Origem |
|---|---|
| `PIX_EFI` | Pago via PIX pelo app |
| `BOLETO_EFI` | Boleto bancário |
| `Direto` | Reserva feita manualmente pelo admin/secretaria |

**Sobre `statusPagamento`:**

| Valor | Significado |
|---|---|
| `PAGO` | Confirmado via EFI/ASAAS |
| `CONFIRMADA` | Confirmado via webhook EFI |
| `AGUARDANDO` | PIX/Boleto gerado, aguardando pagamento |
| `EXPIRADO` | Não pagou no prazo — senha foi liberada |

> Reservas diretas (`Direto`) têm `valor: 0` e `pagamentoConfirmadoEm: null` por definição.

---

## 3. Saldo da Wallet

```http
GET /api/wallet/saldo
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "eventOwnerId": "PZAznWeQMM7ZRdhLCl8Q",
    "saldoDisponivel": 5238.00,
    "saldoPendente": 0,
    "totalRecebido": 5238.00,
    "totalSacado": 0
  }
}
```

> Saldo é creditado automaticamente a cada pagamento PIX/boleto confirmado. Reservas diretas (`valor: 0`) não geram crédito.

---

## 4. Histórico de Transações

```http
GET /api/wallet/transacoes
GET /api/wallet/transacoes?limit=100
Authorization: Bearer {token}
```

```http
GET /api/wallet/transacoes/{eventId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": "txId123",
      "eventId": "8PSxxFQJZboSjV7FlZRJ",
      "paymentId": "VAQ17750...",
      "senhas": [25, 10],
      "dia": "quarta-feira",
      "valorBruto": 1800.00,
      "taxaPlataforma": 54.00,
      "valorLiquido": 1746.00,
      "tipo": "CREDITO",
      "status": "DISPONIVEL",
      "descricao": "2 senha(s) vendida(s) — quarta-feira",
      "createdAt": "2026-04-02T18:19:55.000Z"
    }
  ]
}
```

---

## 5. Solicitar Saque

```http
POST /api/wallet/saque
Authorization: Bearer {token}
Content-Type: application/json

{
  "valor": 5238.00,
  "chavePix": "email@parque.com",
  "tipoChave": "EMAIL",
  "nomeTitular": "João Parque LTDA"
}
```

> `tipoChave`: `CPF`, `CNPJ`, `EMAIL`, `TELEFONE`, `ALEATORIA`

**Sucesso (200):**
```json
{ "success": true, "saqueId": "saqueXyz123", "message": "Saque solicitado com sucesso" }
```

**Saldo insuficiente (400):**
```json
{ "success": false, "error": "Saldo insuficiente. Disponível: R$ 500.00" }
```

---

## 6. Histórico de Saques

```http
GET /api/wallet/saques
Authorization: Bearer {token}
```

```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": "saqueXyz123",
      "valor": 5238.00,
      "chavePix": "email@parque.com",
      "tipoChave": "EMAIL",
      "nomeTitular": "João Parque LTDA",
      "status": "SOLICITADO",
      "createdAt": "2026-04-02T10:00:00.000Z"
    }
  ]
}
```

> Ciclo de status: `SOLICITADO` → `PROCESSANDO` → `PAGO` | `FALHOU` | `CANCELADO`

---

## Rotas Admin

```http
# Vincular evento antigo ao organizador
PATCH /api/wallet/admin/evento/{eventId}/organizador
Body: { "organizerId": "userId_do_parque" }

# Saques pendentes para processar
GET /api/wallet/admin/saques-pendentes

# Atualizar status de saque
PATCH /api/wallet/admin/saque/{saqueId}
Body: { "status": "PAGO", "observacao": "PIX enviado" }

# Ver todas as wallets
GET /api/wallet/admin/wallets
```

---

## Fluxo do Front (passo a passo)

```
1. POST /api/auth/login → guarda token + user.id

2. GET /api/wallet/meus-eventos
   → lista eventos onde organizerId == userId
   → se vazio: evento antigo, admin precisa vincular via PATCH admin/evento/:id/organizador

3. Usuário clica em um evento
   → GET /api/wallet/vendas/{eventId}
   → exibe tabela de senhas com filtros por dia/categoria/método
   → exibe resumo: totalVendas, totalPagas, totalLiquido

4. GET /api/wallet/saldo
   → exibe saldo disponível para saque

5. Usuário clica em "Solicitar Saque"
   → POST /api/wallet/saque
   → exibe confirmação ou erro de saldo insuficiente

6. GET /api/wallet/saques
   → exibe histórico de saques com status atual
```

---

## Tratamento de erros

| HTTP | Motivo |
|---|---|
| `401` | Token ausente ou expirado |
| `403` | Evento não pertence ao organizador do token |
| `400` | Saldo insuficiente no saque / dados inválidos |
| `500` | Erro interno (ver campo `error` na resposta) |

```json
{ "success": false, "error": "Acesso negado: este evento não pertence ao seu usuário" }
```


Base URL produção: `https://api-3sxev7xp7q-uc.a.run.app`

---
