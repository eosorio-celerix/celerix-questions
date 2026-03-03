export const awsConfig = {
  accessKeyId: 'AKIAT3FDQELUWD6DE47Q',
  secretAccessKey: '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',
  region: 'us-east-1',
};

export const dynamoDBConfig = {
  tableName: 'CVFetcher',
  // IMPORTANTE: Verifica en la consola de AWS DynamoDB cuál es el nombre exacto
  // de la clave de partición (Partition key) de la tabla CVFetcher
  // Opciones comunes: 'documento', 'id', 'documentoIdentidad', 'cedula', 'identityDocument'
  partitionKeyName: 'Cedula', // Cambia esto al nombre correcto de tu clave de partición
};

/** Tabla para registrar aceptaciones de Términos y Condiciones. Crear en AWS DynamoDB con PK "id" (String). */
export const termsAcceptancesTable = {
  tableName: 'TermsAcceptances',
  partitionKeyName: 'id',
};
