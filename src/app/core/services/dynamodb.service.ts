import { Injectable } from '@angular/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { awsConfig, dynamoDBConfig } from '../config/aws.config';
import { UserFormData } from '../models/user-form.model';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DynamoDBService {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  constructor() {
    this.client = new DynamoDBClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });

    // Configurar el cliente de documento con opciones explícitas
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
        convertClassInstanceToMap: false,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  }

  getFormByIdentityDocument(
    identityDocument: string
  ): Observable<UserFormData | null> {
    // Usar el nombre de la clave de partición configurado
    // Cedula es numérico, convertir el string a número
    const partitionKey = String(dynamoDBConfig.partitionKeyName);
    const key: Record<string, number> = {};
    key[partitionKey] = parseInt(identityDocument, 10);

    const command = new GetCommand({
      TableName: dynamoDBConfig.tableName,
      Key: key,
    });

    console.log('Buscando en DynamoDB:', {
      TableName: dynamoDBConfig.tableName,
      Key: key,
    });

    return from(this.docClient.send(command)).pipe(
      map((result) => {
        console.log('Resultado de DynamoDB:', result);
        if (result.Item) {
          // Mapear los datos de DynamoDB al formato del formulario
          const mappedData = this.mapDynamoDBItemToFormData(result.Item as any);
          return mappedData;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error obteniendo formulario de DynamoDB:', error);
        console.error('Detalles del error:', {
          message: error.message,
          code: error.code,
          statusCode: error.$metadata?.httpStatusCode,
          requestId: error.$metadata?.requestId,
        });
        throw error;
      })
    );
  }

  saveForm(formData: UserFormData): Observable<UserFormData> {
    // Crear el item directamente con todos los campos necesarios
    // Asegurarse de que la clave de partición esté presente con el nombre correcto
    // Cedula es numérico, convertir el string a número
    const partitionKey = String(dynamoDBConfig.partitionKeyName);
    const item: Record<string, any> = {
      ...formData,
      [partitionKey]: parseInt(formData.identityDocument, 10),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    console.log('Guardando en DynamoDB:', {
      TableName: dynamoDBConfig.tableName,
      Item: item,
    });

    const command = new PutCommand({
      TableName: dynamoDBConfig.tableName,
      Item: item,
    });

    return from(this.docClient.send(command)).pipe(
      map(() => formData),
      catchError((error) => {
        console.error('Error guardando formulario en DynamoDB:', error);
        throw error;
      })
    );
  }

  updateForm(formData: UserFormData): Observable<UserFormData> {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: Record<string, string> = {};

    // Agregar el nombre de la clave de partición a los nombres de atributos
    expressionAttributeNames['#partitionKey'] = dynamoDBConfig.partitionKeyName;

    Object.keys(formData).forEach((key) => {
      if (formData[key as keyof UserFormData] !== undefined) {
        // Usar nombres de atributos para evitar problemas con caracteres especiales
        const attrName = `#attr_${key}`;
        expressionAttributeNames[attrName] = key;
        updateExpressions.push(`${attrName} = :${key}`);
        expressionAttributeValues[`:${key}`] = formData[key as keyof UserFormData];
      }
    });

    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    // Usar el nombre de la clave de partición configurado
    // Cedula es numérico, convertir el string a número
    const partitionKey = String(dynamoDBConfig.partitionKeyName);
    const key: Record<string, number> = {};
    key[partitionKey] = parseInt(formData.identityDocument, 10);

    const command = new UpdateCommand({
      TableName: dynamoDBConfig.tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    return from(this.docClient.send(command)).pipe(
      map((result) => {
        return result.Attributes as UserFormData;
      }),
      catchError((error) => {
        console.error('Error actualizando formulario en DynamoDB:', error);
        throw error;
      })
    );
  }

  /**
   * Mapea los datos de DynamoDB al formato UserFormData
   */
  private mapDynamoDBItemToFormData(item: any): UserFormData {
    // Función helper para extraer valores de DynamoDB (formato nativo o documento)
    const getValue = (field: any): string => {
      if (field === null || field === undefined) return '';
      // Si viene en formato nativo de DynamoDB (con tipos S, N, etc.)
      if (typeof field === 'object' && (field.S || field.N)) {
        return field.S || String(field.N || '');
      }
      // Si ya viene en formato documento (valor directo)
      return String(field);
    };

    // Mapear directamente los campos del formulario
    const formData: UserFormData = {
      // Personal Information
      fullName: getValue(item.fullName) || '',
      identityDocument: getValue(item.identityDocument) || getValue(item.Cedula) || '',
      birthDate: getValue(item.birthDate) || '',
      birthPlace: getValue(item.birthPlace) || '',
      email: getValue(item.email) || '',
      city: getValue(item.city) || '',
      country: getValue(item.country) || '',
      phoneNumber: getValue(item.phoneNumber) || '',
      phoneCountryCode: getValue(item.phoneCountryCode) || '+57',

      // Professional History
      school: getValue(item.school) || '',
      degree: getValue(item.degree) || '',

      // Work Experience
      company: getValue(item.company) || '',
      position: getValue(item.position) || '',
      startDate: getValue(item.startDate) || '',
      endDate: getValue(item.endDate) || '',
      immediateLeader: getValue(item.immediateLeader) || '',
      mainResponsibilities: getValue(item.mainResponsibilities) || '',
      achievements: getValue(item.achievements) || '',
      whyCloseCycle: getValue(item.whyCloseCycle) || '',

      // Languages
      englishLevel: (getValue(item.englishLevel) as 'Básico' | 'Intermedio' | 'Avanzado') || undefined,
      englishLearningPlace: getValue(item.englishLearningPlace) || '',
      otherLanguage: getValue(item.otherLanguage) || '',
      otherLanguageLevel: (getValue(item.otherLanguageLevel) as 'Básico' | 'Intermedio' | 'Avanzado') || undefined,

      // Additional Personal Information
      preferredName: getValue(item.preferredName) || '',
      superpowerAndKryptonite: getValue(item.superpowerAndKryptonite) || '',
      whatCaughtAttention: getValue(item.whatCaughtAttention) || '',
      uniqueWorkStyle: getValue(item.uniqueWorkStyle) || '',
      questionForCandidates: getValue(item.questionForCandidates) || '',

      // Energy Distribution and Scenario
      energyAspect1: getValue(item.energyAspect1) ? parseFloat(getValue(item.energyAspect1)) : undefined,
      energyAspect2: getValue(item.energyAspect2) ? parseFloat(getValue(item.energyAspect2)) : undefined,
      energyAspect3: getValue(item.energyAspect3) ? parseFloat(getValue(item.energyAspect3)) : undefined,
      energyAspect4: getValue(item.energyAspect4) ? parseFloat(getValue(item.energyAspect4)) : undefined,
      scenarioAction: (getValue(item.scenarioAction) as 'public' | 'private' | 'other') || undefined,
      scenarioExplanation: getValue(item.scenarioExplanation) || '',

      // Answer to Own Question
      answerToOwnQuestion: getValue(item.answerToOwnQuestion) || '',
    };

    return formData;
  }
}
