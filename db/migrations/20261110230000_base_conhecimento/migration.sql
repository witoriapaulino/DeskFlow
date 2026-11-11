-- CreateTable
CREATE TABLE "solucoes" (
    "id" SERIAL NOT NULL,
    "chamado_id" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "tecnico_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artigos_conhecimento" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "chamado_origem_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artigos_conhecimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solucoes_chamado_id_key" ON "solucoes"("chamado_id");

-- AddForeignKey
ALTER TABLE "solucoes" ADD CONSTRAINT "solucoes_chamado_id_fkey" FOREIGN KEY ("chamado_id") REFERENCES "chamados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solucoes" ADD CONSTRAINT "solucoes_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos_conhecimento" ADD CONSTRAINT "artigos_conhecimento_chamado_origem_id_fkey" FOREIGN KEY ("chamado_origem_id") REFERENCES "chamados"("id") ON DELETE SET NULL ON UPDATE CASCADE;
