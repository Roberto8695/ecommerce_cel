const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Base de datos PostgreSQL conectada correctamente');
    return prisma;
  } catch (error) {
    console.error(`Error al conectar a la base de datos: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };