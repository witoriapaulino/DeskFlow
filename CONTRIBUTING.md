# Regras de contribuição (IC-GC-03, v1.0)

Responsável: Alexandre Tavares (Gerente de Configuração)

## 1. Branches
- `main`: versão estável. Depois do commit inicial, só recebe alterações por Pull Request (PR).
- Uma branch por integrante, com o próprio nome:
  `alexandre-tavares` · `anna-witoria` · `ana-carvalho` · `thalita-hipolito` · `waleska-lima`
- Antes de começar uma tarefa, atualize sua branch com a `main`:
  ```bash
  git checkout main && git pull
  git checkout <sua-branch> && git merge main
  ```

## 2. Commits
- Cada integrante commita **da própria conta do GitHub**, com o próprio nome e e-mail configurados no Git.
- Padrão da mensagem: `tipo(escopo): descrição curta`
  - `docs(plano): inclui cronograma v0.2`
  - `docs(gc): atualiza status do IC-DOC-03`
  - `feat(RF01): abre chamado`
  - `test(RF03): valida cálculo de SLA`
  - `ci: adiciona Newman ao pipeline`
- Um assunto por commit.

## 3. Pull Requests
- Título igual ao commit principal; na descrição, cite os ICs alterados (ex.: `IC-DOC-01 v0.2 → v0.3`).
- **Revisão obrigatória de todos:** quem abre o PR adiciona os outros 4 integrantes em **Reviewers**. Cada um abre o arquivo, confere e responde em **Files changed → Review changes**:
  - **Approve** quando está tudo certo;
  - **Request changes**, com um comentário dizendo o que corrigir, quando algo está errado.
- O que conferir na revisão: o conteúdo da parte alterada, a versão no **Histórico de Revisões** e a linha do IC na **Planilha de Controle de ICs**.
- Com as 4 aprovações, o Gerente de Configuração faz o merge. A `main` fica protegida no GitHub para não aceitar merge sem as revisões.
- Se mudar um documento, atualize também a **versão na Planilha de Controle de ICs** e o **Histórico de Revisões** do documento.

## 4. Arquivos .docx e .xlsx
São binários: o Git não consegue juntar duas edições ao mesmo tempo. **Uma pessoa por vez** altera cada documento, na ordem combinada no grupo. Antes de editar, faça `git pull` na `main`.

## 5. Mudanças após baseline
Depois que um IC entra em baseline (BL-REQ-S1, BL-IMPL-S2, BL-REL-S3), qualquer alteração segue o PCM:
**RFC → Triagem → Análise → Aprovação do CCB → Planejamento → Validação → Encerramento**, registrado nos formulários em `pcm/`.
