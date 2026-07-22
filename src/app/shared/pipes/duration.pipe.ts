import { Pipe, PipeTransform } from '@angular/core';

/** Formats a number of hours as e.g. "24h" or "1d 4h". */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(hours: number | null | undefined): string {
    if (!hours || hours <= 0) return '—';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 8); // learning "days" of ~8h
    const rem = hours % 8;
    return rem ? `${days}d ${rem}h` : `${days}d`;
  }
}
