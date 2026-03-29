import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { UserFormData } from '../models/user-form.model';

const scenarioLabels: Record<string, string> = {
  public: '¿Lo corriges en público?',
  private: '¿Esperas a discutirlo en privado?',
  other: '¿Buscas otra manera de abordar el problema?',
};

@Injectable({
  providedIn: 'root',
})
export class BiographicReportPdfService {
  downloadReport(data: UserFormData): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 16;
    const pageW = doc.internal.pageSize.getWidth();
    const maxW = pageW - margin * 2;
    let y = 18;

    const ensureSpace = (linesNeeded: number, lineHeight = 5): void => {
      const pageH = doc.internal.pageSize.getHeight();
      if (y + linesNeeded * lineHeight > pageH - 14) {
        doc.addPage();
        y = 18;
      }
    };

    const title = (t: string): void => {
      ensureSpace(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(t, margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    };

    const paragraph = (label: string, value: string | number | undefined): void => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      const v = String(value);
      const block = doc.splitTextToSize(`${label}: ${v}`, maxW);
      ensureSpace(block.length + 1);
      doc.text(block, margin, y);
      y += block.length * 5 + 3;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Informe biográfico', margin, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const gen = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    doc.text(`Generado: ${gen}`, margin, y);
    y += 10;

    title('Datos personales');
    paragraph('Nombre completo', data.fullName);
    paragraph('Documento de identidad', data.identityDocument);
    paragraph('Fecha de nacimiento', data.birthDate);
    paragraph('Lugar de nacimiento', data.birthPlace);
    paragraph('Correo electrónico', data.email);
    paragraph('Ciudad', data.city);
    paragraph('País', data.country);
    const phone =
      data.phoneCountryCode && data.phoneNumber
        ? `${data.phoneCountryCode} ${data.phoneNumber}`
        : data.phoneNumber;
    paragraph('Teléfono', phone);

    title('Formación');
    paragraph('Institución', data.school);
    paragraph('Título / grado', data.degree);

    title('Experiencia laboral');
    paragraph('Empresa', data.company);
    paragraph('Cargo', data.position);
    paragraph('Fecha de inicio', data.startDate);
    paragraph('Fecha de finalización', data.endDate);
    paragraph('Líder inmediato', data.immediateLeader);
    paragraph('Principales responsabilidades', data.mainResponsibilities);
    paragraph('Logros', data.achievements);
    paragraph('¿Por qué cerraste ese ciclo?', data.whyCloseCycle);

    title('Idiomas');
    paragraph('Nivel de inglés', data.englishLevel);
    paragraph('¿Dónde aprendiste inglés?', data.englishLearningPlace);
    paragraph('Otro idioma', data.otherLanguage);
    paragraph('Nivel de otro idioma', data.otherLanguageLevel);

    title('Información adicional');
    paragraph('Nombre preferido', data.preferredName);
    paragraph('Superpoder y kryptonita', data.superpowerAndKryptonite);
    paragraph('¿Qué te atrajo de la oportunidad?', data.whatCaughtAttention);
    paragraph('Estilo de trabajo único', data.uniqueWorkStyle);
    paragraph('Pregunta para candidatos', data.questionForCandidates);

    title('Energía y escenario');
    paragraph('Aspecto de energía 1 (%)', data.energyAspect1);
    paragraph('Aspecto de energía 2 (%)', data.energyAspect2);
    paragraph('Aspecto de energía 3 (%)', data.energyAspect3);
    paragraph('Aspecto de energía 4 (%)', data.energyAspect4);
    const scenario =
      data.scenarioAction != null
        ? scenarioLabels[data.scenarioAction] ?? data.scenarioAction
        : '';
    paragraph('Escenario elegido', scenario);
    paragraph('Explicación del escenario', data.scenarioExplanation);

    title('Respuesta a la pregunta propia');
    paragraph('Respuesta', data.answerToOwnQuestion);

    const safeDoc = (data.identityDocument || 'candidato').replace(/\s+/g, '-');
    doc.save(`informe-biografico-${safeDoc}.pdf`);
  }
}
