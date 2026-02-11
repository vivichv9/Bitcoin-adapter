# Документация изменений от 2026-02-11 (этап 9: тестирование и релиз)

## Что реализовано
1. Интеграционные тесты с Bitcoin Core:
- добавлен `tests/integration/bitcoin-core.integration.test.mjs`;
- проверяются базовые RPC методы (`getblockchaininfo`, `getnetworkinfo`, `validateaddress`);
- тесты автоматически пропускаются, если не заданы env-переменные RPC.

2. Регрессионный сценарий:
- добавлен `scripts/regression.mjs`;
- выполняет unit-тесты и сборку как единый regression flow.

3. npm scripts:
- в `package.json` добавлены:
  - `test:integration`
  - `test:regression`

4. Релизные артефакты:
- добавлен `CHANGELOG.md` (release candidate `v0.1.0-rc.1`);
- добавлен `RELEASE.md` с release checklist и env-конфигурацией для integration тестов.

5. Обновлены файлы контроля качества:
- `scripts/lint.mjs` включает новые скрипты и integration test.

6. Обновлена документация проекта:
- `README.md` дополнен командами и разделом этапа 9;
- `PLANS.md` дополнен статусом выполнения этапов.

## Результат
Проект завершил базовый цикл разработки и получил минимально необходимую инфраструктуру для релизной подготовки и проверки совместимости с локальным Bitcoin Core node.
