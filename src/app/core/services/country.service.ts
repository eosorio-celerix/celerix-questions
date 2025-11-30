import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Country {
  code: string;
  flag: string;
  name: string;
  dialCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private apiUrl = 'https://restcountries.com/v3.1/all?fields=name,cca2,flag,idd';
  private fallbackCountries: Country[] = [
    { code: '+57', flag: '🇨🇴', name: 'Colombia', dialCode: '+57' },
    { code: '+1', flag: '🇺🇸', name: 'United States', dialCode: '+1' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico', dialCode: '+52' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina', dialCode: '+54' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil', dialCode: '+55' },
    { code: '+56', flag: '🇨🇱', name: 'Chile', dialCode: '+56' },
    { code: '+51', flag: '🇵🇪', name: 'Peru', dialCode: '+51' },
    { code: '+34', flag: '🇪🇸', name: 'Spain', dialCode: '+34' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom', dialCode: '+44' },
    { code: '+33', flag: '🇫🇷', name: 'France', dialCode: '+33' },
    { code: '+49', flag: '🇩🇪', name: 'Germany', dialCode: '+49' },
    { code: '+39', flag: '🇮🇹', name: 'Italy', dialCode: '+39' },
    { code: '+1', flag: '🇨🇦', name: 'Canada', dialCode: '+1' },
  ];

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((countries) => {
        return countries
          .filter((country) => country.idd?.root && country.idd?.suffixes)
          .map((country) => {
            const dialCode = country.idd.root + (country.idd.suffixes[0] || '');
            return {
              code: dialCode,
              flag: country.flag || '🏳️',
              name: country.name.common || country.name,
              dialCode: dialCode,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
      }),
      catchError((error) => {
        console.warn('Error fetching countries from API, using fallback:', error);
        return of(this.fallbackCountries);
      })
    );
  }

  getCountriesForPhone(): Observable<Country[]> {
    // Popular countries first, then rest
    const popularCountryCodes = ['CO', 'US', 'MX', 'AR', 'BR', 'CL', 'PE', 'ES', 'GB', 'FR', 'DE', 'IT', 'CA'];
    
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((countries) => {
        const allCountries = countries
          .filter((country) => country.idd?.root && country.idd?.suffixes)
          .map((country) => {
            const dialCode = country.idd.root + (country.idd.suffixes[0] || '');
            return {
              code: dialCode,
              flag: country.flag || '🏳️',
              name: country.name.common || country.name,
              dialCode: dialCode,
              cca2: country.cca2,
            };
          });

        // Sort: popular first, then alphabetically
        const popular = allCountries.filter((c: any) => 
          popularCountryCodes.includes(c.cca2)
        ).sort((a: any, b: any) => {
          const indexA = popularCountryCodes.indexOf(a.cca2);
          const indexB = popularCountryCodes.indexOf(b.cca2);
          return indexA - indexB;
        });

        const rest = allCountries
          .filter((c: any) => !popularCountryCodes.includes(c.cca2))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        return [...popular, ...rest].map(({ cca2, ...country }) => country);
      }),
      catchError((error) => {
        console.warn('Error fetching countries from API, using fallback:', error);
        return of(this.fallbackCountries);
      })
    );
  }
}

