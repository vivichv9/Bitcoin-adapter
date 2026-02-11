# Документация изменений от 2026-02-11 (этап 6: проверка подписи транзакции)

## Что реализовано
1. Добавлена UI-форма проверки подписи транзакции:
- `index.html` добавлена секция "Проверка подписи транзакции";
- поля: signed raw tx hex и optional `maxFeeRate`;
- добавлены отдельные блоки ошибок и результата.

2. Добавлены схемы и нормализация:
- `src/lib/form-schemas.js` добавлена схема `tx_signature_check`;
- `src/lib/normalizers.js` добавлен `normalizeTxSignatureCheckInput`.

3. Расширена валидация типов:
- `src/lib/validation.js` добавлен тип `number`;
- optional-поля корректно пропускаются при пустом значении.

4. Добавлен RPC helper для проверки транзакции:
- `src/lib/rpc.js`:
  - `buildTestMempoolAcceptParams`;
  - `formatMempoolAcceptResult`.

5. Клиентская интеграция:
- `src/main.js`:
  - обработчик формы проверки подписи;
  - RPC вызов `testmempoolaccept`;
  - вывод `valid/invalid`, `reason`, `txid`, `details`.

6. Добавлены тесты:
- `tests/rpc.test.mjs` дополнен кейсами для `testmempoolaccept` helper;
- `tests/normalizers.test.mjs` дополнен нормализацией нового ввода;
- `tests/validation.test.mjs` дополнен схемой `tx_signature_check`.

7. Обновлен README:
- добавлен раздел о проверке подписи транзакции.

## Результат
Приложение теперь умеет проверять корректность подписанной транзакции через Bitcoin Core RPC и выдавать человеку понятный вердикт с причиной отклонения.
