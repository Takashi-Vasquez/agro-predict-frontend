import { ExcerptPipe } from './excerpt.pipe';
import { GetValueByKeyPipe } from './get-value-by-key.pipe';
import { RelativeTimePipe } from './relative-time.pipe';
// export { ExcerptPipe, GetValueByKeyPipe, RelativeTimePipe };

export const SHARED_PIPES = [
  ExcerptPipe,
  GetValueByKeyPipe,
  RelativeTimePipe
];
