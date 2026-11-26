# Origen de estos datos

**TACO – Tabela Brasileira de Composição de Alimentos**, 4ª edição revisada e ampliada.
NEPA – Núcleo de Estudos e Pesquisas em Alimentação, UNICAMP. Campinas, 2011.
Página oficial: https://www.nepa.unicamp.br/taco/

> Licencia según la propia publicación: "É permitida a reprodução total ou parcial do material, desde que seja citada a fonte." (se permite reproducirla total o parcialmente citando la fuente).

Los archivos CSV de esta carpeta vienen del proyecto **taco-api** de Raul de Melo
(https://github.com/raulfdm/taco-api, licencia MIT), que los extrajo de la planilla oficial y los normalizó así:

- `NA` (no aplica / sin dato) → vacío. En la app eso se muestra como **"sin dato"**, nunca como 0.
- `Tr` (trazas, cantidad mínima) → 0.

Ajuste propio de Combi Rutinas (en `scripts/convertir-taco.mjs`): en carnes, pescados, huevos, lácteos y grasas, la fibra "no aplica" se guarda como 0, porque estos alimentos no tienen fibra dietética.

Para regenerar `src/datos/alimentos-taco.json`:

```bash
node scripts/convertir-taco.mjs
```
