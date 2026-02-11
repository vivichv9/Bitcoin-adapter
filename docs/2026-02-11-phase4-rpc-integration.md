# Документация изменений от 2026-02-11 (этап 4: интеграция с Bitcoin RPC)

## Что реализовано
1. Добавлен RPC-слой в клиенте:
- `src/lib/rpc.js`;
- формирование параметров `sendrawtransaction` и `generateblock`;
- формирование endpoint с optional wallet-path;
- форматирование RPC-ошибок.

2. Добавлена конфигурация Bitcoin node в UI:
- в `index.html` добавлены поля `protocol`, `host`, `port`, `username`, `password`, `wallet`;
- конфиг сохраняется в `localStorage`.

3. Добавлены RPC-действия в UI:
- кнопка вызова `sendrawtransaction` с hex из формы;
- форма вызова `generateblock` с адресом;
- вывод ошибок и результата RPC-вызовов.

4. Реализован локальный RPC proxy в dev-сервере:
- `scripts/dev-server.mjs` добавляет `POST /api/rpc`;
- проксирование JSON-RPC запроса к Bitcoin Core с Basic Auth;
- возврат ошибок и результатов в клиент.

5. Расширена схема валидации:
- `src/lib/form-schemas.js` добавлены схемы `rpc_node` и `generate_block`;
- `src/lib/validation.js` поддерживает `enum` и строковые `minLength/maxLength`.

6. Добавлена нормализация для RPC и generateblock:
- `src/lib/normalizers.js` добавлен normalize для node-config и адреса.

7. Добавлены тесты:
- `tests/rpc.test.mjs` для payload/error/endpoint;
- `tests/validation.test.mjs` дополнен кейсами `rpc_node` и `generate_block`.

8. Обновлен `README.md`:
- добавлены инструкции по RPC-интеграции и текущий статус этапов.

## Результат
Приложение теперь может не только генерировать hex, но и отправлять RPC-вызовы в Bitcoin Core через локальный proxy-слой с валидацией конфигурации и понятными ошибками.
