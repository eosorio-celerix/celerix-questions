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

    // Parsear informacionBasica (puede venir como string estructurado)
    const infoBasica = getValue(item.informacionBasica);
    let parsedInfo: any = {};
    
    if (infoBasica) {
      // Intentar parsear si viene como string estructurado
      try {
        const lines = infoBasica.split('\n');
        lines.forEach((line: string) => {
          if (line.includes('Nombre Completo:') || line.includes('Nombre:')) {
            parsedInfo.fullName = line.split(':')[1]?.trim() || '';
          }
          if (line.includes('Documento Identidad:') || line.includes('Documento:')) {
            parsedInfo.identityDocument = line.split(':')[1]?.trim() || '';
          }
          if (line.includes('Fecha Nacimiento:') || line.includes('Fecha:')) {
            parsedInfo.birthDate = line.split(':')[1]?.trim() || '';
          }
          if (line.includes('Lugar de Nacimiento:') || line.includes('Lugar Nacimiento:')) {
            parsedInfo.birthPlace = line.split(':')[1]?.trim() || '';
          }
          if (line.includes('Correo Electronico:') || line.includes('Correo:') || line.includes('Email:')) {
            parsedInfo.email = line.split(':')[1]?.trim() || '';
          }
          if (line.includes('Ciudad:') || line.includes('City:')) {
            parsedInfo.city = line.split(':')[1]?.trim() || '';
          }
          if (line.includes('País:') || line.includes('Country:')) {
            parsedInfo.country = line.split(':')[1]?.trim() || '';
          }
          if (line.includes('Numero Celular:') || line.includes('Teléfono:') || line.includes('Phone:')) {
            const phone = line.split(':')[1]?.trim() || '';
            const phoneMatch = phone.match(/^(\+\d{1,3})\s*(.+)$/);
            if (phoneMatch) {
              parsedInfo.phoneCountryCode = phoneMatch[1];
              parsedInfo.phoneNumber = phoneMatch[2].replace(/\s/g, '');
            } else {
              parsedInfo.phoneNumber = phone.replace(/\s/g, '');
            }
          }
        });
      } catch (e) {
        // Si no se puede parsear, usar el valor directo
        console.warn('No se pudo parsear informacionBasica:', e);
      }
    }

    // Parsear Educacion
    const educacion = getValue(item.Educacion);
    let parsedEducacion: any = {};
    if (educacion) {
      try {
        const educaciones = educacion.split('\n\n');
        const primeraEducacion = educaciones.find((edu: string) => 
          edu.includes('Estado: Completado') || edu.includes('Estado: Completada')
        ) || educaciones[0];
        
        if (primeraEducacion) {
          const lines = primeraEducacion.split('\n');
          lines.forEach((line: string) => {
            if (line.includes('Institución:') || line.includes('Institucion:')) {
              parsedEducacion.school = line.split(':')[1]?.trim() || '';
            }
            if (line.includes('Título:') || line.includes('Titulo:')) {
              parsedEducacion.degree = line.split(':')[1]?.trim() || '';
            }
          });
        }
      } catch (e) {
        console.warn('No se pudo parsear Educacion:', e);
      }
    }

    // Parsear Empleo
    const empleo = getValue(item.Empleo);
    let parsedEmpleo: any = {};
    if (empleo) {
      try {
        const experiencias = empleo.split('\n\n');
        if (experiencias.length > 0) {
          const primeraExp = experiencias[0];
          const lines = primeraExp.split('\n');
          lines.forEach((line: string) => {
            if (line.includes('Empresa:')) {
              parsedEmpleo.company = line.split(':')[1]?.trim() || '';
            }
            if (line.includes('Cargo:')) {
              parsedEmpleo.position = line.split(':')[1]?.trim() || '';
            }
            if (line.includes('Período:') || line.includes('Periodo:')) {
              const periodo = line.split(':')[1]?.trim() || '';
              const dates = periodo.split(' - ');
              parsedEmpleo.startDate = dates[0]?.trim() || '';
              parsedEmpleo.endDate = dates[1]?.trim() || '';
            }
            if (line.includes('Descripción:') || line.includes('Descripcion:')) {
              parsedEmpleo.mainResponsibilities = line.split(':')[1]?.trim() || '';
            }
          });
        }
      } catch (e) {
        console.warn('No se pudo parsear Empleo:', e);
      }
    }

    // Parsear Idiomas
    const idiomas = getValue(item.Idiomas);
    let parsedIdiomas: any = {};
    if (idiomas) {
      try {
        const idiomasList = idiomas.split('\n\n');
        const ingles = idiomasList.find((idioma: string) => idioma.includes('Inglés') || idioma.includes('Ingles'));
        if (ingles) {
          const lines = ingles.split('\n');
          lines.forEach((line: string) => {
            if (line.includes('Nivel:')) {
              const nivel = line.split(':')[1]?.trim() || '';
              if (nivel === '0' || nivel === '1') {
                parsedIdiomas.englishLevel = 'Básico';
              } else if (nivel === '2') {
                parsedIdiomas.englishLevel = 'Intermedio';
              } else if (nivel === '3' || nivel === '4' || nivel === '5') {
                parsedIdiomas.englishLevel = 'Avanzado';
              }
            }
            if (line.includes('Dónde aprendió:') || line.includes('Donde aprendio:')) {
              parsedIdiomas.englishLearningPlace = line.split(':')[1]?.trim() || '';
            }
          });
        }
        
        const otrosIdiomas = idiomasList.filter((idioma: string) => 
          !idioma.includes('Español') && !idioma.includes('Espanol') && !idioma.includes('Inglés') && !idioma.includes('Ingles')
        );
        if (otrosIdiomas.length > 0) {
          const otroIdioma = otrosIdiomas[0];
          const lines = otroIdioma.split('\n');
          lines.forEach((line: string) => {
            if (line.includes('Idioma:')) {
              parsedIdiomas.otherLanguage = line.split(':')[1]?.trim() || '';
            }
            if (line.includes('Nivel:')) {
              const nivel = line.split(':')[1]?.trim() || '';
              if (nivel === '0' || nivel === '1') {
                parsedIdiomas.otherLanguageLevel = 'Básico';
              } else if (nivel === '2') {
                parsedIdiomas.otherLanguageLevel = 'Intermedio';
              } else if (nivel === '3' || nivel === '4' || nivel === '5') {
                parsedIdiomas.otherLanguageLevel = 'Avanzado';
              }
            }
          });
        } else {
          parsedIdiomas.otherLanguage = 'No';
        }
      } catch (e) {
        console.warn('No se pudo parsear Idiomas:', e);
      }
    }

    // Mapear los campos del formulario combinando datos directos y parseados
    const formData: UserFormData = {
      // Personal Information (de informacionBasica parseado o campos directos)
      fullName: parsedInfo.fullName || getValue(item.fullName) || '',
      identityDocument: getValue(item.Cedula) || parsedInfo.identityDocument || getValue(item.identityDocument) || '',
      birthDate: parsedInfo.birthDate || getValue(item.birthDate) || '',
      birthPlace: parsedInfo.birthPlace || getValue(item.birthPlace) || '',
      email: parsedInfo.email || getValue(item.email) || '',
      city: parsedInfo.city || getValue(item.city) || '',
      country: parsedInfo.country || getValue(item.country) || '',
      phoneNumber: parsedInfo.phoneNumber || getValue(item.phoneNumber) || '',
      phoneCountryCode: parsedInfo.phoneCountryCode || getValue(item.phoneCountryCode) || '+57',

      // Professional History (de Educacion parseado)
      school: parsedEducacion.school || getValue(item.school) || '',
      degree: parsedEducacion.degree || getValue(item.degree) || '',

      // Work Experience (de Empleo parseado)
      company: parsedEmpleo.company || getValue(item.company) || '',
      position: parsedEmpleo.position || getValue(item.position) || '',
      startDate: parsedEmpleo.startDate || getValue(item.startDate) || '',
      endDate: parsedEmpleo.endDate || getValue(item.endDate) || '',
      immediateLeader: getValue(item.immediateLeader) || '',
      mainResponsibilities: parsedEmpleo.mainResponsibilities || getValue(item.mainResponsibilities) || '',
      achievements: getValue(item.achievements) || '',
      whyCloseCycle: getValue(item.whyCloseCycle) || '',

      // Languages (de Idiomas parseado)
      englishLevel: parsedIdiomas.englishLevel || (getValue(item.englishLevel) as 'Básico' | 'Intermedio' | 'Avanzado') || undefined,
      englishLearningPlace: parsedIdiomas.englishLearningPlace || getValue(item.englishLearningPlace) || '',
      otherLanguage: parsedIdiomas.otherLanguage || getValue(item.otherLanguage) || '',
      otherLanguageLevel: parsedIdiomas.otherLanguageLevel || (getValue(item.otherLanguageLevel) as 'Básico' | 'Intermedio' | 'Avanzado') || undefined,

      // Additional Personal Information
      preferredName: getValue(item.nombreFavorito) || getValue(item.preferredName) || '',
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
