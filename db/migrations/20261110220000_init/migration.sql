-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('USUARIO', 'TECNICO', 'GESTOR');

-- CreateEnum
CREATE TYPE "StatusChamado" AS ENUM ('ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO', 'FECHADO');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'USUARIO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamados" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusChamado" NOT NULL DEFAULT 'ABERTO',
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "solicitante_id" INTEGER NOT NULL,
    "tecnico_id" INTEGER,
    "prazo_sla" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "resolvido_em" TIMESTAMP(3),

    CONSTRAINT "chamados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "chamados_status_idx" ON "chamados"("status");

-- CreateIndex
CREATE INDEX "chamados_tecnico_id_idx" ON "chamados"("tecnico_id");

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
