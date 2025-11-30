import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: string): string {
    if (displayFormat === 'DD MMM YYYY') {
      const day = date.getDate();
      const monthNames = [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return super.format(date, displayFormat);
  }

  override parse(value: string): Date | null {
    if (!value) {
      return null;
    }

    // Try to parse format "26 nov 2025"
    const monthNames = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];

    const parts = value.trim().split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = monthNames.indexOf(parts[1].toLowerCase());
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && month !== -1 && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    // Fallback to default parsing
    return super.parse(value);
  }
}
